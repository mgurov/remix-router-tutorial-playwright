import type { Page } from "@playwright/test";
import { test as baseTest } from '@playwright/test';
import { nextId } from "./nextId";

export class World {
    contacts: Contact[] = [];
    calls: Call[] = [];

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

          await page.route('/api/calls/by-contact/*', async(route, request) => {
            const { pathname: path } = new URL(request.url());
            const callByContactIdMatch = path.match('/api/calls/by-contact/([^/]+)$');
            if (callByContactIdMatch) {
                const contactId = callByContactIdMatch[1];
                const matchedCalls = this.calls.filter(c => c.associatedContactId === contactId) 
                return await route.fulfill({json: matchedCalls.map(c => c.toListJson())})
            }

            console.warn('contact API route not implemented', request.method(), path);
            await route.fulfill({ status: 555, body: 'route not implemented' });

          })

    }

    givenContact(spec: ContactSpec = {}): Contact {
        const contact = new Contact(nextId(), spec);
        this.contacts.push(contact);
        if (spec.lastContact) {
            this.calls.push(
                new Call(nextId(), spec.lastContact, contact.id)
            )
        }
        return contact;
    }

}

type ContactSpec = {
    first?: string,
    last?: string,
    notes?: string,
    avatar?: string,
    lastContact?: string,
}

export class Contact {
    constructor(public id: string, private spec: ContactSpec) {

    }

    get firstName() {
        return this.spec.first ?? "First_" + this.id;
    }

    get lastName() {
        return this.spec.last ?? "Last_" + this.id;
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
            notes: this.spec.notes ?? "no notes",
        }
    }
}

export class Call {
    constructor(
        public id: string, 
        public timestamp: string,
        public associatedContactId: string,
    ) {}

    toListJson() {
        return {
            id: this.id,
            timestamp: this.timestamp,
            associatedContactId: this.associatedContactId,
        }
    }
}

export async function routeWorld(page: Page): Promise<World> {    
    await page.route('/api/**/*', async (route, request) => {
        console.warn('unmocked route', request.method(), request.url());
        await route.abort();
      });

    const world = new World();

    await world.route(page);

    return world;
}

export const worldlyTest = baseTest.extend<{ world: World }>({
  world: [async ({ page }, use) => {
    const world = await routeWorld(page);
    await use(world);
  }, { auto: true }],
});
