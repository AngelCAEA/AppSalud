import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
interface Rol{
    id : number,
    name: string,
    description: string
}
interface RolesPageProps {
    roles: Rol[]
}

export default function Roles({ roles }: RolesPageProps) {
    return (
        <AppLayout breadcrumbs={[{ title: "Roles", href: "#" }]}> 
            <Head title="Roles" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex justify-between items-center p-2">
                    <h2 className="text-lg font-semibold">Roles</h2>
                    <div className="relative">
                        <Button
                            variant="outline"
                            className="absolute right-0 top-1/2 transform -translate-y-1/2 cursor-pointer"
                        >
                            <CirclePlus className=" h-4 w-4" />
                            Add Role
                        </Button>
                    </div>
                </div>
                <div className="overflow-x-auto rounded border">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="px-4 py-2 text-left">Name</th>
                                <th className="px-4 py-2 text-left">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.length > 0 ? (
                                roles.map((r) => (
                                    <tr key={r.id} className="border-b">
                                        <td className="px-4 py-2">{r.name}</td>
                                        <td className="px-4 py-2">{r.description}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={2} className="px-4 py-2 text-center">
                                        No roles found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    )
}