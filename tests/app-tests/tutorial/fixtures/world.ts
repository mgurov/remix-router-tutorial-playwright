import type { Page } from "@playwright/test";
import { nextId } from "./nextId";

export class World {
    contacts: Contact[] = [];

    async route(page: Page) {
          await page.route('/api/contacts', route => route.fulfill({ json: this.contacts.map(c => c.toListJson()) }))

          await page.route('/api/contacts/*', async (route, request) => {
            const { pathname: path } = new URL(request.url());
            
            const contactIdMatch = path.match('/api/contacts/([^/]+)$');
            if (contactIdMatch) {
                const contactId = contactIdMatch[1];
                const contact = this.contacts.find(c => c.id === contactId)
                if (!contact) {
                    return route.fulfill({
                        status: 404,
                        json: {
                            message: 'Contact not found',
                            params: {contactId}
                        }
                    })
                }
                if (request.method() === "GET") {
                    return route.fulfill({json: contact.toGetJson()})
                }
                if (request.method() === "PUT") {
                    contact.update(request.postDataJSON())
                    return route.fulfill({json: contact.toGetJson()})
                }
            }
            
            console.warn('contact API route not implemented', request.method(), path);
            await route.fulfill({ status: 555, body: 'route not implemented' });
          })
    }

    givenContact(spec: ContactSpec = {}): Contact {
        const contact = new Contact(nextId(), spec);
        this.contacts.push(contact);
        return contact;
    }

}

type ContactSpec = {
    first?: string,
    last?: string,
    notes?: string,
    avatar?: string,
}

class Contact {
    constructor(public id: string, private spec: ContactSpec) {

    }

    get firstName() {
        return this.spec.first ?? "First_" + this.id;
    }

    get lastName() {
        return this.spec.first ?? "Last_" + this.id;
    }

    update(postData: unknown) {
        this.spec = Object.assign({}, this.spec, postData)
    }

    toListJson() {
        return {
            id: this.id,
            first: this.firstName,
            last: this.lastName,
        }
    }

    toGetJson() {
        return {
            ...this.toListJson(),
            avatar: this.spec.avatar ?? "https://placecats.com/200/200",
            notes: this.spec.notes ?? null,
        }
    }
}