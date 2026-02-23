import { redirect } from 'next/navigation';

export default async function AIInterviewRedirect({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    redirect(`/interview${queryString ? `?${queryString}` : ''}`);
}
