import PageWrappingFixture from "./PageWrappingFixture";

export default class EditContactPage extends PageWrappingFixture {
    get form() {
        return this.page.locator("#contact-form");
    }

    get avatar() {
        return this.form.getByLabel('Avatar URL');
    }

    get notes() {
        return this.form.getByLabel('Notes');
    }

    get saveButton() {
        return this.form.locator("button").getByText("Save");
    }
}