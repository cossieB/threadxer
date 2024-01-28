import { For, createSignal } from "solid-js"
import styles from '~/styles/components/DropZone.module.scss'
import { DeleteSvg } from "~/svgs"

type P = {
    images: string[]
    setImages: (arr: string[]) => void
}
export function MediaPreview(props: P) {
    const [lastDragOverIndex, setLastDragOverIndex] = createSignal(-1);

    return (
        <div class={styles.previews}>
            <For each={props.images}>
                {(image, i) =>
                    <div
                        class={styles.imgContainer}
                        draggable
                        onDragEnd={() => {
                            // i is the index of the image being dragged before being dragged
                            // lastDragoverIndex index the image is being moved to.

                            {/**
                                Illustration of what is happening. Example: image at index 1 is being moved to index 3
                                [0,1,2,3,4]
                                [0,2,3,1,4]
                            */}

                            if (lastDragOverIndex() == i()) return;
                            const newArr: string[] = []
                            let indexOnNewArray = 0

                            // looping through the images
                            for (let j = 0; j < props.images.length; j++) {
                                if (j === i()) continue; // skip the image that's being moved. Note indexOnNewArray doesn't get incremented
                                if (indexOnNewArray == lastDragOverIndex()) {
                                    newArr.push(image);
                                }
                                newArr.push(props.images[j])
                                indexOnNewArray++
                            }
                            // for when image is being moved to the end.
                            if (newArr.length < props.images.length)
                                newArr.push(image);
                            props.setImages(newArr)
                            setLastDragOverIndex(-1)
                        }}
                        onDragEnter={e => {
                            const element = e.target as HTMLImageElement
                            setLastDragOverIndex(Number(element.dataset.i))
                        }}
                    >
                        <DeleteSvg onclick={() => props.setImages(props.images.filter((_, j) => i() != j))} />
                        <img data-i={i()} src={image} class="screenshotImg" />
                    </div>
                }
            </For>
        </div>
    )
}

