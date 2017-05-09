# Adobe crowd scripts
Scripts for creating crowds in Adobe Illustrator.

# How to install
Download this repository as a zip folder and save it on your computer at: 
Adobe Illustrator (version) > Presets > en_GB > Scripts

Open Adobe Illustrator. If you already had Illustrator open, quit and re-open it.

You should now be able to access your scripts by clicking: 
File > Scripts

The two scripts you will want to use are:
 - create_crowd_with_symbols.jsx
 - create_crowd_with_symbols_from_path_definition.jsx

# How to use
## create_crowd_with_symbols_from_path_definition.jsx

 - First create your path. This can be on any layer and of any shape, but the path must be named 'crowd-boundary'.
 - Go to File > Scripts and select create_crowd_with_symbols_from_path_definition.jsx to run.
 - A dialog box will appear prompting you to enter the size of your crowd.
 - Now, select your symbols from the dropdown list. When selecting a symbol you will be prompted to enter a probability and a height range before clicking 'add' to add your symbol. To get expected results, the probabilities of all your symbols should add up to exactly one.
 - When you have added the desired number of symbols, click 'submit' to generate your crowd. This may take a while if you have a complex path definition or a large amount of points.
 
## create_crowd_with_symbols.jsx



