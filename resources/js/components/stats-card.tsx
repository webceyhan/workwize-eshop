import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReactNode } from 'react';

interface StatsCardProps {
    title: string;
    content: string | number;
    description: string;
    icon: ReactNode;
}

export default function StatsCard({ title, content, description, icon }: StatsCardProps) {
    return (
        <Card className="gap-2 bg-accent/25">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className="size-4 text-muted-foreground">{icon}</div>
            </CardHeader>

            <CardContent>
                <div className="text-2xl font-bold">{content}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}
