import { submitForm } from "../graphql.js";
export function createSignInForm() {

    const signInContainer = document.createElement("div");
    signInContainer.className = "sign-in-container";

    const signInRadio = document.createElement("input");
    signInRadio.type = "radio";
    signInRadio.name = "optionScreen";
    signInRadio.id = "SignIn";
    signInRadio.hidden = true;
    signInRadio.checked = true;

    const signInSection = document.createElement("section");
    signInSection.className = "sign-in-form";

    const logoDiv = document.createElement("div");
    logoDiv.id = "logo";

    const logoImage = document.createElement("img");
    logoImage.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/GraphQL_Logo.svg/2048px-GraphQL_Logo.svg.png";
    logoImage.alt = "GraphQL Logo";
    logoImage.width = "50";

    const logoHeading = document.createElement("h1");
    logoHeading.textContent = "GraphQL";

    logoDiv.appendChild(logoImage);
    logoDiv.appendChild(logoHeading);

    const nav = document.createElement("nav");

    const signInLabel = document.createElement("label");
    signInLabel.htmlFor = "SignIn";
    signInLabel.textContent = "Sign In";

    nav.appendChild(signInLabel);

    const signInForm = document.createElement("form");
    signInForm.id = "SignInFormData";
    signInForm.addEventListener("submit", submitForm);

    const usernameInput = document.createElement("input");
    usernameInput.type = "text";
    usernameInput.name = "username";
    usernameInput.id = "username";
    usernameInput.placeholder = "Username or E-mail";

    const passwordInput = document.createElement("input");
    passwordInput.type = "password";
    passwordInput.name = "password";
    passwordInput.id = "password";
    passwordInput.placeholder = "Password";

    const submitButton = document.createElement("button");
    submitButton.classList.add("submit-sign-in")
    submitButton.type = "submit";
    submitButton.title = "Sign In";
    submitButton.textContent = "Sign In";

    const authorsButton = document.createElement("button");
    authorsButton.classList.add("authors-sign-in")
    authorsButton.type = "button";
    authorsButton.textContent = "Author's Progress";
    authorsButton.addEventListener("click",submitForm)

    signInForm.appendChild(usernameInput);
    signInForm.appendChild(passwordInput);
    signInForm.appendChild(submitButton);
    signInForm.appendChild(authorsButton);

    nav.appendChild(signInLabel);
    signInSection.appendChild(logoDiv);
    signInSection.appendChild(nav);
    signInSection.appendChild(signInForm);
    signInContainer.appendChild(signInRadio);
    signInContainer.appendChild(signInSection);

    document.body.appendChild(signInContainer);
}