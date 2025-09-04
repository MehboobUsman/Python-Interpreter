document.addEventListener('DOMContentLoaded',function(){
    // Intializing codeMirror with Syntax Highlighting
    const editor= CodeMirror.fromTextArea(document.getElementById("code"),{
       mode:"python",
       theme:"material",
       lineNumbers:true,
       indentUnit:4,
       smartIndent:true,
       matchBrackets:true,
       autoCloseBrackets:true,
       lineWrapping:true
    });    
    //Default Python Code
    editor.setValue("print('Hello, World')");

    //function to compile code with dynamic input handling
    async function compileCode() {
        const code=editor.getValue();
        const outputElement=document.getElementById("output");
        outputElement.textContent="🔃 Running ...";
        // Check if input() is needed
        const inputPattren=/input\((?:'|"|`)(.*?)(?:'|"|`)\)/g;
        const inputPrompts=[...code.matchAll(inputPattren)].map(match => match[1]);

        if(inputPrompts.length >0){
            // Clear previous content
            
            outputElement.innerHTML='<h3> Provide Input:</h3>';

            // Create Container for Inputs

            const inputsContainer = document.createElement('div');
            inputsContainer.classList.add('inputs-container');

            inputPrompts.forEach((prompt,index)=>{
                const inputGroup = document.createElement('div');
                inputGroup.classList.add('input-group');

                const label = document.createElement('label');

                label.setAttribute('for', `input-${index}`);
                label.textContent = prompt;

                const input = document.createElement('input');
                input.type = 'text';
                input.id = `input-${index}`;
                input.classList.add('user-input');

                //Append label and input to the input group
                inputGroup.appendChild(label);
                inputGroup.appendChild(input);

                //Append input group to the inputs container

                inputsContainer.appendChild(inputGroup);
            });

            //Append inputs container to the output element

            outputElement.appendChild(inputsContainer);

            // Create and append the submit button

            const submitButton = document.createElement('button');
            submitButton.id = 'submit-inputs-btn';
            submitButton.textContent = 'Submit Inputs';
            outputElement.appendChild(submitButton);

            //Attach event listner to submit button

            submitButton.addEventListener('click', submitInputs);
            return;

        }

        await executeCode(code);
    }
    // Function to execute code
    async function executeCode(code, inputs=[]){
        const outputElement = document.getElementById("output");
        outputElement.textContent= "🔃 Running....";

        // Replace input() calls with provided inputs
        inputs.forEach((input, index)=>{
            code = code.replace(/input\((?:'|"|`)(.*?)(?:'|"|`)\)/, `"${input}"`);
        });

        try{
            const response = await fetch("https://emkc.org/api/v2/piston/execute", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    language: "python",
                    version: "3.10.0",
                    files: [{content: code}]
                })
            });

            if(!response.ok)  throw new Error("Error Execution !...");

            const result = await response.json();
            const output = result.run?.output || "NO OUTPUT!...";

            // Add the '>' before the output, miniking terminal behaviour

            outputElement.innerHTML = `> ${output}`;
        }catch (error){
            outputElement.textContent = "Error: " + error.message;
        }
    }

    // Collect inputs and rerun code
    function submitInputs(){
        const inputs = Array.from(document.querySelectorAll(".user-input")).map(input => input.value);
        const code = editor.getValue();
        executeCode(code, inputs);
    }

    // Add event Listner to run code button

    const runButton = document.querySelector(".run-btn");
    runButton.addEventListener('click', compileCode);
});