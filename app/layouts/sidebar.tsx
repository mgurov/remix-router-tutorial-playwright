import { Form, Link, Outlet, } from "react-router";
//import { getContacts } from "../data";
import type { Route } from "./+types/sidebar";

export async function clientLoader() {
  const response = await fetch('/api/contacts')
  if (response.status === 200) {
    const contacts = await response.json() as ContactDto[]
    return { contacts };
  } else {
    return { contacts: [], error: `Unexpected status code ${response.status} ${response.statusText}` }
  }
}

type ContactDto = {
  id: string;
  first?: string;
  last?: string;
  favorite?: boolean;
}

export default function SidebarLayout({
  loaderData,
}: Route.ComponentProps) {
  const { contacts, error } = loaderData;

  return (
    <>
      <div id="sidebar">
        <h1>
          <Link to="about">React Router Contacts</Link>
        </h1>
        <div>
          <Form id="search-form" role="search">
            <input
              aria-label="Search contacts"
              id="q"
              name="q"
              placeholder="Search"
              type="search"
            />
            <div
              aria-hidden
              hidden={true}
              id="search-spinner"
            />
          </Form>
          <Form method="post">
            <button type="submit">New</button>
          </Form>
        </div>
        <nav>
          {contacts.length ? (
            <ul>
              {contacts.map((contact) => (
                <li key={contact.id}>
                  <Link to={`contacts/${contact.id}`}>
                    {contact.first || contact.last ? (
                      <>
                        {contact.first} {contact.last}
                      </>
                    ) : (
                      <i>No Name</i>
                    )}
                    {contact.favorite ? (
                      <span>★</span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            error ? <p>
              <i>Error fetching contacts: {error}</i>
            </p> :
              <p>
                <i>No contacts</i>
              </p>
          )}
        </nav>
      </div>
      <div id="detail">
        <Outlet />
      </div>
    </>
  );
}