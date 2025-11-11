import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/infrastructure/adapters/supabase/config';
import { AuthApiError } from '@supabase/supabase-js';

type SyncPayload = {
    docente: {
        email: string;
        numeroDocumento: string;
        tipoDocumento: string;
        nombres: string;
        apellidoPaterno: string;
        apellidoMaterno?: string | null;
        rol: string;
    };
    previousEmail?: string | null;
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

function buildMetadata(payload: SyncPayload['docente']) {
    return {
        nombres: payload.nombres,
        apellidoPaterno: payload.apellidoPaterno,
        apellidoMaterno: payload.apellidoMaterno ?? null,
        numeroDocumento: payload.numeroDocumento,
        tipoDocumento: payload.tipoDocumento,
        rol: payload.rol,
    } satisfies Record<string, unknown>;
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as SyncPayload | null;

        if (!body?.docente) {
            return NextResponse.json({ message: 'Payload inválido para sincronizar personal.' }, { status: 400 });
        }

        const { docente, previousEmail } = body;

        if (!docente.email?.trim() || !docente.numeroDocumento?.trim()) {
            return NextResponse.json({ message: 'Email y número de documento son obligatorios.' }, { status: 400 });
        }

        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return NextResponse.json(
                { message: 'SUPABASE_SERVICE_ROLE_KEY no está configurada. No se pueden crear usuarios de autenticación.' },
                { status: 503 }
            );
        }

        const desiredPassword = docente.numeroDocumento.trim();
        const metadata = buildMetadata(docente);

        const upsertUser = async (userId: string, updatePassword: boolean = false) => {
            const updateData: any = {
                email: docente.email,
                email_confirm: true,
                user_metadata: metadata,
                app_metadata: { role: docente.rol },
            };

            // Solo actualizar contraseña si se solicita explícitamente
            if (updatePassword) {
                updateData.password = desiredPassword;
            }

            const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, updateData);

            if (error) {
                throw error;
            }
        };

        if (previousEmail && previousEmail.toLowerCase() !== docente.email.toLowerCase()) {
            const previousUser = await findUserByEmail(previousEmail);
            if (previousUser) {
                // Cambió el email, actualizar con nueva contraseña
                await upsertUser(previousUser.id, true);
                return NextResponse.json({ status: 'updated' }, { status: 200 });
            }
        }

        const existingUser = await findUserByEmail(docente.email);

        if (!existingUser) {
            const { error } = await supabaseAdmin.auth.admin.createUser({
                email: docente.email,
                password: desiredPassword,
                email_confirm: true,
                user_metadata: metadata,
                app_metadata: { role: docente.rol },
            });

            if (error) {
                if (error instanceof AuthApiError && error.message?.toLowerCase().includes('already been registered')) {
                    const user = await findUserByEmail(docente.email);
                    if (user) {
                        // Usuario ya existe, solo actualizar metadata (sin cambiar contraseña)
                        await upsertUser(user.id, false);
                        return NextResponse.json({ status: 'updated' }, { status: 200 });
                    }
                }

                throw error;
            }

            return NextResponse.json({ status: 'created' }, { status: 201 });
        }

        // Usuario existe, solo actualizar metadata (sin cambiar contraseña)
        await upsertUser(existingUser.id, false);

        return NextResponse.json({ status: 'updated' }, { status: 200 });
    } catch (error) {
        if (error instanceof AuthApiError && error.status === 401) {
            return NextResponse.json(
                { message: 'Supabase Auth admin no disponible: API key inválida o sin permisos.' },
                { status: 503 }
            );
        }

        if (error instanceof Error) {
            console.error('[auth-sync] Error:', error.message);
            return NextResponse.json({ message: error.message }, { status: 500 });
        }

        console.error('[auth-sync] Error desconocido:', error);
        return NextResponse.json({ message: 'Error desconocido sincronizando personal.' }, { status: 500 });
    }
}
