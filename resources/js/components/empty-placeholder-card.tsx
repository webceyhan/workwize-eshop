import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReactNode } from 'react';
import { Button } from './ui/button';

interface EmptyPlaceholderCardProps {
    icon: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
}

export default function EmptyPlaceholderCard({ title, action, description, icon }: EmptyPlaceholderCardProps) {
    return (
        <Card className="text-center">
            <CardHeader>
                <div className="mx-auto size-10 text-muted-foreground">{icon}</div>

                <CardTitle>{title}</CardTitle>

                <CardDescription>{description}</CardDescription>
            </CardHeader>

            {action && (
                <CardContent>
                    <Button asChild>{action}</Button>
                </CardContent>
            )}
        </Card>
    );
}
