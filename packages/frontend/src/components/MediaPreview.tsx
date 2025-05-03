import { For, Match, Switch, createSignal } from "solid-js"
import styles from '~/styles/components/DropZone.module.scss'
import { DeleteSvg } from "~/svgs"

type P = {
    images: {
        url: string;
        file: File;
    }[]
    setImages: (arr: {
        url: string;
        file: File;
    }[]) => void
}
export function MediaPreview(props: P) {
    const [lastDragOverIndex, setLastDragOverIndex] = createSignal(-1);

    return (
        <div class={styles.previews}>
            <For each={props.images}>
                {(data, i) =>
                    <div
                        class={styles.imgContainer}
                        draggable
                        onDragEnd={() => {
                            // i is the index of the image being dragged before being dragged
                            // lastDragoverIndex is the index the image is being moved to.

                            {/**
                                Illustration of what is happening. 
                                Example: image at index 1 is being moved to index 3
                                [0,1,2,3,4] <---- props.images
                                [0,2,3,1,4] <---- newArr
                            */}

                            if (lastDragOverIndex() == i()) return;
                            const newArr: typeof props.images = []
                            let indexOnNewArray = 0

                            // looping through the images
                            for (let j = 0; j < props.images.length; j++) {
                                if (j === i()) continue; // skip the image that's being moved. Note indexOnNewArray doesn't get incremented
                                if (indexOnNewArray == lastDragOverIndex()) {
                                    newArr.push(data);
                                }
                                newArr.push(props.images[j])
                                indexOnNewArray++
                            }
                            // for when image is being moved to the end.
                            if (newArr.length < props.images.length)
                                newArr.push(data);
                            props.setImages(newArr)
                            setLastDragOverIndex(-1)
                        }}
                        onDragEnter={e => {
                            const element = e.target as HTMLImageElement
                            setLastDragOverIndex(Number(element.dataset.i))
                        }}
                    >
                        <DeleteSvg onclick={() => props.setImages(props.images.filter((_, j) => i() != j))} />
                        <Switch fallback={"Unsupported content"} >
                            <Match when={data.file.type.includes('image')}>
                                <img data-i={i()} src={data.url} />
                            </Match>
                            <Match when={data.file.type.includes('video')}>
                                <video data-i={i()} src={data.url} />
                            </Match>
                        </Switch>
                    </div>
                }
            </For>
        </div>
    )
}

