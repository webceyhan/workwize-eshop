import { Button } from '@/components/ui/button';
import { Paginated } from '@/types';
import { router } from '@inertiajs/react';
import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from 'lucide-react';

export default function Pagination({ current_page, last_page, first_page_url, prev_page_url, next_page_url, last_page_url }: Paginated<any>) {
    return (
        <div className="my-4 flex items-center justify-between">
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Page {current_page} of {last_page}
            </div>
            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => router.get(first_page_url!)}
                    disabled={current_page === 1}
                >
                    <span className="sr-only">Go to first page</span>
                    <ChevronsLeftIcon />
                </Button>
                <Button variant="outline" className="h-8 w-8 p-0" onClick={() => router.get(prev_page_url!)} disabled={!prev_page_url}>
                    <span className="sr-only">Go to previous page</span>
                    <ChevronLeftIcon />
                </Button>
                <Button variant="outline" className="h-8 w-8 p-0" onClick={() => router.get(next_page_url!)} disabled={!next_page_url}>
                    <span className="sr-only">Go to next page</span>
                    <ChevronRightIcon />
                </Button>
                <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => router.get(last_page_url!)}
                    disabled={last_page === current_page}
                >
                    <span className="sr-only">Go to last page</span>
                    <ChevronsRightIcon />
                </Button>
            </div>
        </div>
    );
}
