import {test, expect, describe, assert} from "vitest"
import { getHashtags } from "../../utils/getHashtags"

describe("Hashtags test", () => {
    test("returns array", () => {
        const result = getHashtags("Hello world")
        assert(Array.isArray(result))   
    })
    test("No hashtags", () => {
        const result = getHashtags("Hello world")
        expect(result).toStrictEqual([])
    })
    test("returns only hashtags", () => {
        const result = getHashtags("#test #hello world this is a test")
        expect(result).toEqual(["#test", "#hello"])
    })
    test("invalid characters in hashtag", () => {
        const result = getHashtags("#@me #hello world")
        expect(result).toStrictEqual(["#hello"])
    })
})