import { Form } from "react-router";
import type { Route } from "./+types/edit-contact";

import type { ContactRecord } from "../data";

//TODO: extract into an API util with types
export async function clientLoader({ params }: Route.LoaderArgs): Promise<LoaderResponse> {
  const response = await fetch(`/api/contacts/${params.contactId}`);
  if (response.status === 200) {
    const contact = await response.json() as ContactRecord
    return { contact };
  } else {
    return { error: `Unexpected status code ${response.status} ${response.statusText}` }
  }
}

type LoaderResponse = {
  contact: ContactRecord
} | {
  error: string
};

export default function EditContact({
  loaderData,
}: Route.ComponentProps) {
  if ("contact" in loaderData) {
    return <RenderEditContact contact={loaderData.contact} />
  }
  if ("error" in loaderData) {
    return <RenderError error={loaderData.error} />
  }
}

function RenderError({ error }: { error: string }) {
  return <div id="contact">
    <i>Error fetching contact: {error}</i>
  </div>;
}

function RenderEditContact({
  contact,
}: { contact: ContactRecord }) {

  return (
    <Form key={contact.id} id="contact-form" method="post">
      <p>
        <span>Name</span>
        <input
          aria-label="First name"
          defaultValue={contact.first}
          name="first"
          placeholder="First"
          type="text"
        />
        <input
          aria-label="Last name"
          defaultValue={contact.last}
          name="last"
          placeholder="Last"
          type="text"
        />
      </p>
      <label>
        <span>Twitter</span>
        <input
          defaultValue={contact.twitter}
          name="twitter"
          placeholder="@jack"
          type="text"
        />
      </label>
      <label>
        <span>Avatar URL</span>
        <input
          aria-label="Avatar URL"
          defaultValue={contact.avatar}
          name="avatar"
          placeholder="https://example.com/avatar.jpg"
          type="text"
        />
      </label>
      <label>
        <span>Notes</span>
        <textarea
          defaultValue={contact.notes}
          name="notes"
          rows={6}
        />
      </label>
      <p>
        <button type="submit">Save</button>
        <button type="button">Cancel</button>
      </p>
    </Form>
  );
}
