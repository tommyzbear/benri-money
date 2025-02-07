import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Pencil } from "lucide-react";
import Link from "next/link";

export function AccountProfile() {
    return (
        <Card className="mb-8">
            <CardContent className="pt-6">
                <div className="relative">
                    <div className="h-32 bg-[#1546a3]" />
                    <div className="absolute bottom-0 left-6 transform translate-y-1/2">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center">
                                <User className="w-12 h-12 text-white" />
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="absolute bottom-0 right-0 rounded-full bg-white shadow-lg"
                            >
                                <Pencil className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="mt-16 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">Tom Zhang</h2>
                            <p className="text-sm text-muted-foreground">
                                Complete Your Personal Profile
                            </p>
                        </div>
                        <Button variant="ghost" className="text-blue-600">
                            Change Name
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 