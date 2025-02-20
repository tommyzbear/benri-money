import { BenriStarShape } from "../ui/shapes";

interface ProfileImgProps {
    imageUrl?: string;
    fill?: string;
    className?: string;
}

export function ProfileImgMask({ imageUrl, fill, className }: ProfileImgProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
            viewBox="0 0 60 60"
            className={className}
        >
            <defs>
                <mask id="profile-mask">
                    <BenriStarShape fill="white" />
                </mask>
            </defs>
            {imageUrl ? (
                <image href={imageUrl} width="100%" height="100%" mask="url(#profile-mask)" />
            ) : (
                <rect width="100%" height="100%" fill={fill || "white"} mask="url(#profile-mask)" />
            )}
        </svg>
    );
}
