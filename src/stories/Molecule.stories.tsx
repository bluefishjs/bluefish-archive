import type { Meta, StoryObj } from "storybook-solidjs";
import { withBluefish, WithBluefishProps } from "../withBluefish";
import Atom from "../chemistry/atom";
import Bond from "../chemistry/bond";
import { Bluefish } from "../bluefish";
import { Row } from "../row";
import Ref from "../ref";
import Group from "../group";
import SmilesDrawer from "smiles-drawer/app.js";
import SvgDrawer from "smiles-drawer/src/SvgDrawer";
import ThemeManager from "smiles-drawer/src/ThemeManager";
import { For } from "solid-js";

const meta: Meta = {
  title: "Example/Molecule",
};

export default meta;
type Story = StoryObj;

// Code for chemical molecule; integrates with Smiles Drawer
export type MoleculeProps = { chemicalFormula: string; ariaLabel: string };

const Molecule = withBluefish((props: MoleculeProps) => {
  let options = {};
  let bonds: any[] = [];
  let atoms: any[] = [];
  let rings: any[] = [];

  let chemicalDrawer = new SvgDrawer(options);

  SmilesDrawer.parse(props.chemicalFormula, function (tree: any) {
    let preprocessor = chemicalDrawer.preprocessor;
    preprocessor.initDraw(tree, "dark", false, []);

    if (!false) {
      chemicalDrawer.themeManager = new ThemeManager(
        chemicalDrawer.opts.themes,
        "dark"
      );
      if (chemicalDrawer.svgWrapper === null || chemicalDrawer.clear) {
        const fakeSvgWrapper = {
          maxX: -Number.MAX_VALUE,
          maxY: -Number.MAX_VALUE,
          minX: Number.MAX_VALUE,
          minY: Number.MAX_VALUE,
          opts: chemicalDrawer.opts,
          drawingWidth: 0,
          drawingHeight: 0,
        };
        chemicalDrawer.svgWrapper = fakeSvgWrapper;
      }
    }

    preprocessor.processGraph();

    determineDimensions(chemicalDrawer.svgWrapper, preprocessor.graph.vertices);

    let [tempEdges, tempVertices, tempRings] =
      extractVerticeEdgeRingInformation(chemicalDrawer);

    bonds = bonds.concat(tempEdges);
    atoms = atoms.concat(tempVertices);
    rings = rings.concat(tempRings);
  });

  function extractVerticeEdgeRingInformation(drawer: any) {
    const graph = drawer.preprocessor.graph;
    const edges = graph.edges.map((edgeObject: any) => {
      return {
        ...edgeObject,
        id: `edge-${edgeObject.id}`,
        idNum: edgeObject.id,
        sourceId: `vertex-${edgeObject.sourceId}`,
        sourceNum: edgeObject.sourceId,
        destId: `vertex-${edgeObject.targetId}`,
        destNum: edgeObject.targetId,
        ref: `edge-${edgeObject.id}`,
        lcr: drawer.preprocessor.areVerticesInSameRing(
          drawer.preprocessor.graph.vertices[edgeObject.sourceId],
          drawer.preprocessor.graph.vertices[edgeObject.targetId]
        )
          ? drawer.preprocessor.getLargestOrAromaticCommonRing(
              drawer.preprocessor.graph.vertices[edgeObject.sourceId],
              drawer.preprocessor.graph.vertices[edgeObject.targetId]
            )
          : null,
      };
    });

    const vertices = graph.vertices.map((vObject: any) => {
      return {
        ...vObject,
        xLoc: vObject.position.x,
        yLoc: vObject.position.y,
        id: `vertex-${vObject.id}`,
        idNum: vObject.id,
        isTerminal: vObject.isTerminal(),
      };
    });

    const rings = drawer.preprocessor.rings.map((ringObject: any) => {
      return {
        ...ringObject,
        id: `ring-${ringObject.id}`,
        idNum: ringObject.id,
      };
    });

    // for every ring in ring object, add the center of the ring to the edge object
    rings.forEach((ringObject: any) => {
      let ringMembers = ringObject.members;
      let ringCenter = ringObject.center;

      ringMembers.forEach((member: any) => {
        edges.forEach((edge: any) => {
          if (edge.sourceNum === member) {
            edge.ringCenterX = ringCenter.x;
            edge.ringCenterY = ringCenter.y;
          }
        });
      });
    });

    return [edges, vertices, rings];
  }

  const atomNames = atoms.map((v) => v.id) as string[];
  const bondNames = bonds.map((e) => e.id) as string[];
  const ringsName = rings.map((r) => r.id) as string[];

  // Remap the vertices and edges to include the names
  atoms = atoms.map((v, index) => {
    return {
      ...v,
      name: atomNames[index],
    };
  });

  bonds = bonds.map((e, index) => {
    return {
      ...e,
      name: bondNames[index],
    };
  });

  /**
   * Determine drawing dimensiosn based on vertex positions.
   *
   * @param {Vertex[]} vertices An array of vertices containing the vertices associated with the current molecule.
   */
  function determineDimensions(svgWrapper: any, vertices: any) {
    for (var i = 0; i < vertices.length; i++) {
      if (!vertices[i].value.isDrawn) {
        continue;
      }

      let p = vertices[i].position;

      if (svgWrapper.maxX < p.x) svgWrapper.maxX = p.x;
      if (svgWrapper.maxY < p.y) svgWrapper.maxY = p.y;
      if (svgWrapper.minX > p.x) svgWrapper.minX = p.x;
      if (svgWrapper.minY > p.y) svgWrapper.minY = p.y;
    }

    // Add padding
    let padding = svgWrapper.opts.padding;
    svgWrapper.maxX += padding;
    svgWrapper.maxY += padding;
    svgWrapper.minX -= padding;
    svgWrapper.minY -= padding;

    svgWrapper.drawingWidth = svgWrapper.maxX - svgWrapper.minX;
    svgWrapper.drawingHeight = svgWrapper.maxY - svgWrapper.minY;
  }

  function getLocationVertexWithId(vertexId: any, vertices: any) {
    const vertex = vertices.filter((v: any) => {
      return v.id === vertexId;
    });
    return vertex[0];
  }

  function findOffsetsToFitDiagram(vertices: any) {
    let xOffsets: any[] = [];
    let yOffsets: any[] = [];

    for (let i = 0; i < vertices.length; i++) {
      let vertex = vertices[i];
      xOffsets.push(vertex.xLoc);
      yOffsets.push(vertex.yLoc);
    }

    let minX = Math.abs(Math.min(...xOffsets));
    let minY = Math.abs(Math.min(...yOffsets));

    return [minX, minY];
  }

  const [minXOffset, minYOffset] = findOffsetsToFitDiagram(atoms);

  function findEdgesVerticesOfRing(ringElm: any, edges: any, vertices: any) {
    let ringEdges: any[] = [];
    let ringVertices: any[] = [];

    let usedEdges: any[] = [];

    // filter vertices so that only the ones in ringElm are included
    ringVertices = vertices.filter((v: any) => {
      return ringElm.includes(v.id);
    });

    // filter edges, if source and destination of edge in ringElm, then include
    ringEdges = edges.filter((e: any) => {
      return ringElm.includes(e.sourceId) && ringElm.includes(e.destId);
    });

    usedEdges = ringEdges.map((e: any) => {
      return e.id;
    });

    return [{ edges: ringEdges, vertices: ringVertices }, usedEdges];
  }

  // function to separate list of edges, vertices, rings for rendering
  function separateEdgesVerticesRings(edges: any, vertices: any, rings: any) {
    let sepRings: any[] = [];
    let sepEdges: any[] = [];
    let sepVertices: any[] = [];

    let usedVertices: any[] = [];
    let usedEdges: any[] = [];

    for (let i = 0; i < rings.length; i++) {
      let ringElm = rings[i];

      let ringVertexIds = ringElm.members.map((v: any) => {
        return `vertex-${v}`;
      });

      let [ringObject, edgeUsed] = findEdgesVerticesOfRing(
        ringVertexIds,
        edges,
        vertices
      );
      sepRings.push({ ...ringObject, id: ringElm.id });

      usedVertices = usedVertices.concat(ringVertexIds);
      usedEdges = usedEdges.concat(edgeUsed);
    }

    sepVertices = vertices.filter((v: any) => {
      return !usedVertices.includes(v.id);
    });

    sepEdges = edges.filter((e: any) => {
      return !usedEdges.includes(e.id);
    });

    return [sepEdges, sepVertices, sepRings];
  }

  console.log("these are the vertices: ", atoms);
  console.log("these are the edges: ", bonds);
  console.log("these are the rings: ", rings);

  return (
    <Group aria-label={props.ariaLabel}>
      <For each={atoms}>
        {(v, index) => (
          <Atom
            {...v}
            id={atomNames[index()]}
            cx={(v.xLoc + minXOffset + 10) * 1.2}
            cy={(v.yLoc + minYOffset + 10) * 1.2}
            r={10}
            fill="black"
            content={v.value.element}
            isTerminal={v.isTerminal}
            bondCount={v.value.bondCount}
            ariaHidden={true}
          />
        )}
      </For>

      <For each={bonds}>
        {(e, index) => (
          <Bond
            {...e}
            stroke="black"
            stroke-width={2}
            id={bondNames[index()]}
            bondType={e.bondType}
            ringCenterX={(e.ringCenterX + minXOffset + 10) * 1.2}
            ringCenterY={(e.ringCenterY + minYOffset + 10) * 1.2}
          >
            <Ref refId={atomNames[e.sourceNum]} />
            <Ref refId={atomNames[e.destNum]} />
          </Bond>
        )}
      </For>

      {/* Overdraw */}
      <For each={atoms}>
        {(v) => (
          <Atom
            {...v}
            cx={(v.xLoc + minXOffset + 10) * 1.2}
            cy={(v.yLoc + minYOffset + 10) * 1.2}
            r={10}
            fill="black"
            content={v.value.element}
            isTerminal={v.isTerminal}
            bondCount={v.value.bondCount}
            ariaHidden={true}
          />
        )}
      </For>
    </Group>
  );
});

export const AspirinMolecule: Story = {
  args: {
    id: "aspirin",
    chemicalFormula: "CC(OC1=C(C(=O)O)C=CC=C1)=O",
    ariaLabel: "Aspirin Molecule",
  },
  render: (props) => (
    <Bluefish>
      <Molecule
        {...props}
        chemicalFormula={props.chemicalFormula}
        ariaLabel={props.ariaLabel}
      />
    </Bluefish>
  ),
};

export const NicotineMolecule: Story = {
  args: {
    id: "nicotine",
    chemicalFormula: "CN1CCCC1C2=CN=CC=C2",
    ariaLabel: "Nicotine Molecule",
  },
  render: (props) => (
    <Bluefish>
      <Molecule
        {...props}
        chemicalFormula={props.chemicalFormula}
        ariaLabel={props.ariaLabel}
      />
    </Bluefish>
  ),
};

export const SucroseMolecule: Story = {
  args: {
    id: "sucrose",
    chemicalFormula: "C(C1C(C(C(C(O1)OC2(C(C(C(O2)CO)O)O)CO)O)O)O)O",
    ariaLabel: "Sucrose Molecule",
  },
  render: (props) => (
    <Bluefish>
      <Molecule
        {...props}
        chemicalFormula={props.chemicalFormula}
        ariaLabel={props.ariaLabel}
      />
    </Bluefish>
  ),
};

export const PenicillinMolecule: Story = {
  args: {
    id: "Penicillin",
    chemicalFormula: "CC1(C(N2C(S1)C(C2=O)NC(=O)CC3=CC=CC=C3)C(=O)O)C",
    ariaLabel: "Penicillin Molecule",
  },
  render: (props) => (
    <Bluefish>
      <Molecule
        {...props}
        chemicalFormula={props.chemicalFormula}
        ariaLabel={props.ariaLabel}
      />
    </Bluefish>
  ),
};

export const DiphenylEtherMolecule: Story = {
  args: {
    id: "diphenylether",
    chemicalFormula: "C1=CC=C(C=C1)OC2=CC=CC=C2",
    ariaLabel: "Diphenyl ether Molecule",
  },
  render: (props) => (
    <Bluefish>
      <Molecule
        {...props}
        chemicalFormula={props.chemicalFormula}
        ariaLabel={props.ariaLabel}
      />
    </Bluefish>
  ),
};
