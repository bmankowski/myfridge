import { createSupabaseServerClient } from "./auth/supabase-server.js";

export interface AuthResult {
  success: boolean;
  user_id?: string;
  error?: string;
}

/**
 * Validate authentication using Supabase server client with cookie-based sessions
 */
export async function validateAuthToken(request: Request): Promise<AuthResult> {
  try {
    const supabase = createSupabaseServerClient(request);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.log("🔒 Authentication failed:", error?.message || "No user found");
      return {
        success: false,
        error: error?.message || "Not authenticated",
      };
    }
    return {
      success: true,
      user_id: user.id,
    };
  } catch (error) {
    console.error("Authentication validation error:", error);
    return {
      success: false,
      error: "Authentication validation failed",
    };
  }
}

/**
 * Create standardized error responses
 */
export function createErrorResponse(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * Create standardized success responses
 */
export function createSuccessResponse<T = unknown>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
