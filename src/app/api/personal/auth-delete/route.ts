import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/infrastructure/adapters/supabase/config';

type DeletePayload = {
    email: string;
};

async function findUserByEmail(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const perPage = 100;
    let page = 1;

    while (true) {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });

        if (error) {
            throw error;
        }

        const match = data?.users?.find((user) => user.email?.toLowerCase() === normalizedEmail);
        if (match) {
            return match;
        }

        const hasMore = (data?.users?.length ?? 0) === perPage;
        if (!hasMore) {
            break;
        }

        page += 1;
    }

    return null;
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as DeletePayload | null;

        if (!body?.email) {
            return NextResponse.json({ message: 'Email es obligatorio.' }, { status: 400 });
        }

        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return NextResponse.json(
                { message: 'SUPABASE_SERVICE_ROLE_KEY no está configurada.' },
                { status: 503 }
            );
        }

        const user = await findUserByEmail(body.email);

        if (!user) {
            // Usuario no existe en Auth, no es un error
            return NextResponse.json({ status: 'not_found' }, { status: 200 });
        }

        // Eliminar usuario de Supabase Auth
        const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);

        if (error) {
            throw error;
        }

        return NextResponse.json({ status: 'deleted' }, { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            console.error('[auth-delete] Error:', error.message);
            return NextResponse.json({ message: error.message }, { status: 500 });
        }

        console.error('[auth-delete] Error desconocido:', error);
        return NextResponse.json({ message: 'Error desconocido eliminando usuario.' }, { status: 500 });
    }
}
