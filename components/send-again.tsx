import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { MoreVertical, Search } from "lucide-react";

type Contact = {
    initials: string;
    name: string;
    bgColor: string;
};

const contacts: Contact[] = [
    { initials: "CN", name: "Chun H Ng", bgColor: "bg-red-500" },
    { initials: "SN", name: "Sujit Nair", bgColor: "bg-pink-500" },
    { initials: "CR", name: "Chirag Rajani", bgColor: "bg-purple-500" },
    { initials: "Q", name: "Search", bgColor: "bg-blue-900" },
];

export function SendAgain() {
    return (
        <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-xl font-semibold">Send again</h2>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="flex space-x-4">
                    {contacts.map((contact, index) => (
                        <Button
                            key={index}
                            variant="ghost"
                            className="flex flex-col items-center space-y-2"
                        >
                            <div
                                className={`w-12 h-12 rounded-full ${contact.bgColor} text-white flex items-center justify-center`}
                            >
                                {contact.name === "Search" ? (
                                    <Search className="h-6 w-6" />
                                ) : (
                                    contact.initials
                                )}
                            </div>
                            <span className="text-xs">{contact.name}</span>
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
} 