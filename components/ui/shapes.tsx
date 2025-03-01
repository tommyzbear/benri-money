interface ShapeProps {
    className?: string;
    fill?: string;
}

export function BenriStarShape({ className, fill = "currentColor" }: ShapeProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
            viewBox="0 0 60 60"
            className={className}
        >
            <path
                fill={fill}
                d="M 60 60 
                   C 51.148 57.459 40.902 55.984 30 55.984 
                   C 19.098 55.984 8.852 57.459 0 60 
                   C 2.541 51.148 4.016 40.902 4.016 30 
                   C 4.016 19.098 2.541 8.852 0 0 
                   C 8.852 2.541 19.098 4.016 30 4.016 
                   C 40.902 4.016 51.148 2.541 60 0 
                   C 57.459 8.852 55.984 19.098 55.984 30 
                   C 55.984 40.902 57.459 51.148 60 60 Z"
            />
        </svg>
    );
}
