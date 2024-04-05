# Performance Testing

Contains scripts and files for generating test data and testing code speed.

## File Structure

Each diagram that we tested scaling for has a folder for it. Inside each folder is an associated Python file, prefixed with `generate_`, which is used to generate a `.ts` file containing the requisite props for the diagram (with `Props` suffixed).

The code for generating each diagram is in the `tsx` file in the folder, and it's been configured to take as input the result from the generated file.

## Running

In order to test the diagrams like how we tested them, there are a few steps to take:

1. Create an `App.tsx` file in `/public`. This can be done by duplicating the `App.template.tsx` file in the same folder and renaming it to `App.tsx`.

2. Replace the following block of code in `App.tsx`
    ```js
    <Bluefish>
        ...
    </Bluefish>
    ```
    with the name of the component that you are trying to test. The names of the components are as follows:
    
    * Insertion Sort: `<InsertionSortTest />`
    * Ohm Parser: `<OhmParserTest />`
    * Python Tutor: `<PythonTutorTest />`

3. Generate a props file for the diagram you are trying to test. This is done by running `python [the relevant script].py`. For example, for the Insertion Sort diagram, you would run `python generate_insertion_sort.py`. Each script also has parameters that can be changed to get different types of graphs.

4. [Optional] To find the number of nodes in the scenegraph of the diagram that you're generating, you should go into the relevant `.tsx` file and change the `debug={false}` line to `debug={true}`. This will cause Bluefish to print out the total length of the scenegraph. After you find this number, to get more accurate performance results, make sure to change it back to `debug={false}`

5. Run `pnpm dev` to start a localhost server. You should then be able to use browser tools or other means to measure the time it takes Bluefish to render the diagram.