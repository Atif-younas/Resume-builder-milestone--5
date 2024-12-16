document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('resumeForm') as HTMLFormElement | null;
    const resumeOutput = document.getElementById('resume-output') as HTMLDivElement | null;
    const editButton = document.getElementById('edit-button') as HTMLButtonElement | null;
    const shareLinkDiv = document.createElement('div');
    const resumeURLInput = document.createElement('input');
    const copyLinkButton = document.createElement('button');
    const downloadResumeButton = document.createElement('button');

    if (!form || !resumeOutput || !editButton) {
        console.error('Form, resume output, or edit button element not found.');
        return;
    }

    // Helper function to create a new input element
    const createInput = (placeholder: string): HTMLInputElement => {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = placeholder;
        input.classList.add('dynamic-input');
        return input;
    };

    // Functions to add new input fields for each section
    const addInputField = (containerId: string, placeholder: string): void => {
        const container = document.getElementById(containerId);
        if (container) {
            container.appendChild(createInput(placeholder));
        }
    };

    // Attach event listeners to the "Add" buttons
    document.getElementById('addExperience')?.addEventListener('click', () => addInputField('experienceContainer', 'Describe your experience'));
    document.getElementById('addEducation')?.addEventListener('click', () => addInputField('educationContainer', 'Describe your education'));
    document.getElementById('addAward')?.addEventListener('click', () => addInputField('awardsContainer', 'Award/Certification name'));
    document.getElementById('addLanguage')?.addEventListener('click', () => addInputField('languagesContainer', 'Language'));

    // Function to generate the resume
    const generateResume = (event: Event): void => {
        event.preventDefault();

        const fullName = (document.getElementById('fullName') as HTMLInputElement | null)?.value;
        const jobTitle = (document.getElementById('jobTitle') as HTMLInputElement | null)?.value;
        const phone = (document.getElementById('phone') as HTMLInputElement | null)?.value;
        const email = (document.getElementById('email') as HTMLInputElement | null)?.value;
        const linkedin = (document.getElementById('linkedin') as HTMLInputElement | null)?.value;
        const summary = (document.getElementById('summary') as HTMLTextAreaElement | null)?.value;
        const skills = (document.getElementById('skillsInput') as HTMLInputElement | null)?.value;

        if (!fullName || !jobTitle || !phone || !email || !summary || !skills) {
            console.error('One or more input elements are empty.');
            return;
        }

        const skillsList = skills.split(',').map(skill => skill.trim()).filter(skill => skill);

        // Start building the resume HTML
        let resumeHTML = `
            <div class="resume-header">
                <h2 id="resume-name" contenteditable="false" style="color: blue;">${fullName}</h2>
                <p id="resume-job-title" contenteditable="false">${jobTitle}</p>
                <p id="resume-contact" contenteditable="false">Phone: ${phone} | Email: ${email} | LinkedIn: ${linkedin}</p>
            </div>
            <section>
                <h2 style="color: blue;">Professional Summary</h2>
                <p id="resume-summary" contenteditable="false">${summary}</p>
            </section>
            <section>
                <h2 style="color: blue;">Skills</h2>
                <ul id="resume-skills-list">
                    ${skillsList.map(skill => `<li contenteditable="false">${skill}</li>`).join('')}
                </ul>
            </section>
        `;

        // Function to render each dynamic section
        const addSectionItems = (containerId: string, sectionTitle: string): void => {
            const container = document.getElementById(containerId);
            if (container) {
                const items: string[] = [];
                for (let i = 0; i < container.children.length; i++) {
                    const child = container.children[i] as HTMLInputElement;
                    const value = child.value.trim();
                    if (value) items.push(value);
                }
                if (items.length) {
                    resumeHTML += `<section>
                        <h2 style="color: blue;">${sectionTitle}</h2>
                        <ul>${items.map(item => `<li contenteditable="false">${item}</li>`).join('')}</ul>
                    </section>`;
                }
            }
        };

        // Render dynamic sections
        addSectionItems('experienceContainer', 'Work Experience');
        addSectionItems('educationContainer', 'Education');
        addSectionItems('awardsContainer', 'Awards & Certifications');
        addSectionItems('languagesContainer', 'Languages');

        // Display the generated resume
        resumeOutput.innerHTML = resumeHTML;

        // Make edit button visible
        editButton.classList.remove('hidden');

        // Attach "Edit" functionality
        addEditButtonListener();

        // Generate shareable link
        generateShareableLink();

        // Add "Download as PDF" functionality
        addDownloadButton();
    };

    // Function to toggle Edit/Save
    const addEditButtonListener = (): void => {
        editButton.addEventListener('click', () => {
            const isEditing = editButton.textContent === 'Edit';
            const editableElements = resumeOutput?.querySelectorAll('[contenteditable]') || [];

            editableElements.forEach(element => {
                element.setAttribute('contenteditable', String(isEditing));
            });

            editButton.textContent = isEditing ? 'Save' : 'Edit';
        });
    };

    // Function to sync edits made in the generated resume back to the form inputs
    const addEditableListeners = (): void => {
        const editableElements = document.querySelectorAll<HTMLElement>('[contenteditable="true"]');
        editableElements.forEach(element => {
            element.addEventListener('input', (event) => {
                const target = event.target as HTMLElement;
                const id = target.id;

                if (id === 'resume-name') {
                    (document.getElementById('fullName') as HTMLInputElement).value = target.innerText;
                } else if (id === 'resume-job-title') {
                    (document.getElementById('jobTitle') as HTMLInputElement).value = target.innerText;
                } else if (id === 'resume-summary') {
                    (document.getElementById('summary') as HTMLTextAreaElement).value = target.innerText;
                } else if (id === 'resume-contact') {
                    const contactParts = target.innerText.split(' | ');
                    (document.getElementById('phone') as HTMLInputElement).value = contactParts[0].replace('Phone: ', '');
                    (document.getElementById('email') as HTMLInputElement).value = contactParts[1].replace('Email: ', '');
                    (document.getElementById('linkedin') as HTMLInputElement).value = contactParts[2].replace('LinkedIn: ', '');
                }
            });
        });
    };

    // Generate shareable link
    const generateShareableLink = (): void => {
        const resumeURL = `${window.location.origin}/resume/${Date.now()}`;
        shareLinkDiv.innerHTML = `
            <div>
                <p>Shareable Link:</p>
                <input type="text" readonly id="resume-url" value="${resumeURL}">
                <button id="copy-link">Copy Link</button>
            </div>
        `;
        document.getElementById('controls-container')?.appendChild(shareLinkDiv);

        document.getElementById('copy-link')?.addEventListener('click', () => {
            resumeURLInput.select();
            document.execCommand('copy');
            alert('Resume link copied to clipboard!');
        });
    };

    // Add "Download as PDF" functionality
    const addDownloadButton = (): void => {
        downloadResumeButton.textContent = 'Download as PDF';
        downloadResumeButton.id = 'download-resume';
        document.getElementById('controls-container')?.appendChild(downloadResumeButton);

        downloadResumeButton.addEventListener('click', () => {
            const resumeHtml = resumeOutput?.innerHTML;

            // Create a new window with the resume content
            const pdfWindow = window.open('', '', 'width=800,height=600');
            pdfWindow!.document.write('<html><head><title>Resume</title></head><body>');
            pdfWindow!.document.write(resumeHtml!);
            pdfWindow!.document.write('</body></html>');
            pdfWindow!.document.close();

            // Use the browser's print dialog to save as PDF
            pdfWindow!.print();
        });
    };

    // Attach the generateResume function to the form submission
    form.addEventListener('submit', generateResume);
});
