import { createUser, getUser } from "@/lib/queries";

export const config = {
  runtime: "nodejs", // Force nodejs runtime for mongo actions
};

export async function POST(req: Request) {
  try {
    const { fullName, email, password } = await req.json();

    // check if user exists already
    const user = await getUser({ email });

    if (user?._id) return new Response("User already exists", { status: 205 });

    const result = await createUser({ fullName, email, password });

    if (!result.acknowledged && result.insertedId) {
      console.error("User creation failed: Operation not acknowledged");
      return { success: false, error: "Failed to create user" };
    }

    console.log(`User created successfully with ID: ${result.insertedId}`);
    return new Response("User Created Sucessfully!", { status: 200, success: true, userId: result.insertedId.toString() });
  } catch (error) {
    console.error(`An error occured while creating user: ${error}`);
    return new Response("An unexpected error occured", { status: 500 });
  }
}
