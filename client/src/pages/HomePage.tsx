import { Button, Stack, Typography } from "@mui/material";
import { useRef, useState } from "react";
import { useLoadingPixel } from "@/hooks";
import { useInsight } from "@semoss/sdk-react";


export const HomePage = () => {

	const hiddenFileInput = useRef(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const { actions, system } = useInsight();
	const [daysOff, setDaysOff] = useState([]);
	//const { notification } = useNotification();
	const [helloUserResponse, isLoadingHelloUser] =
		useLoadingPixel<string>("HelloUser()");

	const uploadFiles = async (file): Promise<string> => {
		const fileLocations: string[] = [];
		try {
			const response = await actions.upload(file, '');
			const fileLocation = `'${response[0].fileLocation.replace(/^\//, '',)}'`;
			fileLocations.push(fileLocation);
			return fileLocations.join(',');

		} catch (e) {
			console.error("File upload failed:", e);
		}

	};


	const handleClick = () => {
		hiddenFileInput.current.click();
	};

	const handleUpload = async () => {
		const query = `UploadSchedule(FILE_PATH=${await uploadFiles(selectedFile)})`;
		await actions.run(query).then((response) => {
			const { output, operationType } = response.pixelReturn[0];

			if (operationType[0] !== 'ERROR') {
				setDaysOff(output as any);
			}

		})
	};

	return (
		<Stack spacing={2}>
			<Typography variant="h4">Schedule Uploader</Typography>
			<Typography fontStyle="italic">
				{isLoadingHelloUser
					? "Loading..."
					: helloUserResponse}
			</Typography>
			<br />
			<Stack alignItems={'flex-start'}>
				<input
					type="file"
					ref={hiddenFileInput}
					onChange={(e) => setSelectedFile(e.target.files[0])}
					style={{ display: 'none' }}
				/>
				<Button
					variant="contained"
					onClick={handleClick}
				>
					Upload Schedule
				</Button>
				{selectedFile && (<Typography variant="body1" mt={1}>
					Selected File: {selectedFile.name}
				</Typography>
				)}
				{selectedFile && (
					<Button
						variant="outlined"
						onClick={() => handleUpload()}
						sx={{ mt: 2 }}
					>
						Submit File
					</Button>
				)}
				{daysOff.length > 0 && (
					<Stack mt={2} spacing={1}>
						<Typography variant="h6">Days Off:</Typography>
						{daysOff.map((day, index) => (
							<p key={index}>
								{day}
							</p>
						))}
					</Stack>
				)}
			</Stack>
		</Stack>
	);
};
