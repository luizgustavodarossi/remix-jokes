import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, isRouteErrorResponse, useLoaderData, useParams, useRouteError } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";

export const meta: V2_MetaFunction<typeof loader> = ({
  data,
}) => {
  if (!data) {
    return [
      { title: "No joke" },
      { description: "No joke found" }
    ];
  }
  return [
    { title: `"${data.joke.name}" joke` },
    { description: `Enjoy the "${data.joke.name}" joke and much more` }
  ];
};

export const loader = async ({ params }: LoaderArgs) => {
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });

  if (!joke)
    throw new Response("What a joke! Not found.", {
      status: 404,
    });


  return json({ joke });
};

export const action = async ({
  params,
  request,
}: ActionArgs) => {
  const form = await request.formData();

  if (form.get("intent") !== "delete")
    throw new Response(
      `The intent ${form.get("intent")} is not supported`,
      { status: 400 }
    );


  const userId = await requireUserId(request);
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });

  if (!joke)
    throw new Response("Can't delete what does not exist", {
      status: 404,
    });


  if (joke.jokesterId !== userId)
    throw new Response(
      "Pssh, nice try. That's not your joke",
      { status: 403 }
    );


  await db.joke.delete({ where: { id: params.jokeId } });

  return redirect("/jokes");
};

export default function JokeRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <p>Here's your hilarious joke:</p>
      <p>{data.joke.content}</p>
      <Link to=".">{data.joke.name} Permalink</Link>
      <form method="post">
        <button
          className="button"
          name="intent"
          type="submit"
          value="delete"
        >
          Delete
        </button>
      </form>
    </div>
  );
}

export function ErrorBoundary() {
  const { jokeId } = useParams();
  const error = useRouteError();
  console.error(error);

  if (isRouteErrorResponse(error)) {
    switch (error.status) {
      case 400:
        return (
          <div className="error-container">
            What you're trying to do is not allowed.
          </div>
        )

      case 404:
        return (
          <div className="error-container">
            Huh? What the heck is "{jokeId}"?
          </div>
        );

      case 403:
        return (
          <div className="error-container">
            Sorry, but {jokeId} is not your joke.
          </div>
        );

      default:
        throw new Error(`Unhandled error: ${error.status}`);
    }
  }

  return (
    <div className="error-container">
      {`There was an error loading joke by the id ${jokeId}. Sorry.`}
    </div>
  );
}