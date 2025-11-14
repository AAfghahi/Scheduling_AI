import { Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useLoadingPixel } from "@/hooks";

/**
 * Renders the home page.
 *
 * @component
 */
export const HomePage = () => {
	/**
	 * State
	 */
	const [textValue, setTextValue] = useState<string>("");

	/**
	 * Library hooks
	 */
	const [helloUserResponse, isLoadingHelloUser] =
		useLoadingPixel<string>("HelloUser()");
	const [callPythonResponse, isLoadingCallPython] = useLoadingPixel<string>(
		`CallPython(${Number(textValue)})`,
		"",
		!Number(textValue) && textValue !== "0",
	);

	return (
		<Stack spacing={2}>
			<Typography>
				Welcome to the Scheduler App! Upload an excel download of your child's schedule to see when they are free.
			</Typography>
			
		</Stack>
	);
};
