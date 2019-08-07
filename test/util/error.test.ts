import { format } from "util/error";

describe("Util", (): void => {
    describe("Error", (): void => {

        it("should return one error formated correctly", (): void => {
            expect(format("One Error")).toEqual({
                errors: [ {msg: "One Error"} ]
            });
        });

        it("should return multiple errors formated correctly", (): void => {
            expect(format("First Error", "Second Error", "Third Error")).toEqual({
                errors: [ 
                    {msg: "First Error"},
                    {msg: "Second Error"},
                    {msg: "Third Error"}
                ]
            });
        });

    });
});