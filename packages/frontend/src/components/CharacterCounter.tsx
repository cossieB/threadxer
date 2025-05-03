type Props = {
    inputLength: number,
    max: number
}

export function CharacterCounter(props: Props) {
    const radius = 15
    const circumference = 2 * Math.PI * radius
    return (
        <svg height={2 * radius + 10} width={2 * radius + 10}>
            <circle cx="50%" cy="50%" r={radius} stroke-dasharray={`${circumference} ${circumference}`} fill="none" stroke="gray" stroke-width={5} />
            <circle cx="50%" cy="50%" r={radius} stroke-dasharray={`${props.inputLength / props.max * circumference} ${circumference}`} fill="none" stroke="var(--blue1)" stroke-width={5} />
        </svg>
    );
}
