import { Form } from "react-router";
import type { Route } from "./+types/contact"

import type { ContactRecord } from "../data";
import { useQuery } from "@tanstack/react-query";

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

export default function Contact({ loaderData }: Route.ComponentProps) {

  if ("error" in loaderData) {
    const { error } = loaderData;

    if (error) {
      return <div id="contact">
        <i>Error fetching contact: {error}</i>
      </div>;
    }
  }

  if ("contact" in loaderData) {
    const { contact } = loaderData;

    return (
      <div id="contact">
        <div>
          <img
            alt={`${contact.first} ${contact.last} avatar`}
            key={contact.avatar}
            src={contact.avatar}
          />
        </div>
  
        <div>
          <h1>
            {contact.first || contact.last ? (
              <>
                {contact.first} {contact.last}
              </>
            ) : (
              <i>No Name</i>
            )}
            <Favorite contact={contact} />
          </h1>
  
          {contact.twitter ? (
            <p>
              <a
                href={`https://twitter.com/${contact.twitter}`}
              >
                {contact.twitter}
              </a>
            </p>
          ) : null}
  
          {contact.notes ? <p data-testid="notes">{contact.notes}</p> : null}

          <LastContact contact={contact} />
  
          <div>
            <Form action="edit">
              <button type="submit">Edit</button>
            </Form>
  
            <Form
              action="destroy"
              method="post"
              onSubmit={(event) => {
                const response = confirm(
                  "Please confirm you want to delete this record."
                );
                if (!response) {
                  event.preventDefault();
                }
              }}
            >
              <button type="submit">Delete</button>
            </Form>
          </div>
        </div>
      </div>
    );
  }
}

async function fetchCallsByContact(contactId: string): Promise<Array<{timestamp: string}>> {
  const response = await fetch(`/api/calls/by-contact/${contactId}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json() as Promise<Array<{timestamp: string}>>;
}

function LastContact({contact}: {contact: Pick<ContactRecord, "id">}) {

  const {data, error, isLoading} = useQuery({ 
    queryKey: ['contact-calls', contact.id],
    queryFn: () => fetchCallsByContact(contact.id)
  })

   if (isLoading) return <div>Loading calls...</div>;
  if (error) return <div>An error occurred fetching calls: {error.message}</div>;
  if (data && data?.length > 0) {
    return <div data-testid="last-contact">Last Contact: {data[0].timestamp}</div>
  }

  return <div data-testid="last-contact">Last Contact: N/A</div>
}

function Favorite({
  contact,
}: {
  contact: Pick<ContactRecord, "favorite">;
}) {
  const favorite = contact.favorite;

  return (
    <Form method="post">
      <button
        aria-label={
          favorite
            ? "Remove from favorites"
            : "Add to favorites"
        }
        name="favorite"
        value={favorite ? "false" : "true"}
      >
        {favorite ? "★" : "☆"}
      </button>
    </Form>
  );
}
