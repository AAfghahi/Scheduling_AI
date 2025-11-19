import { Button, Stack, Typography, Autocomplete, TextField } from "@mui/material";
import { useRef, useState, useEffect } from "react";
import { useLoadingPixel } from "@/hooks";
import { useInsight } from "@semoss/sdk-react";
import { Model, LLMResponse } from "./constants";
import { Markdown } from "@/components";


export const HomePage = () => {

	const hiddenFileInput = useRef(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const { actions, system } = useInsight();
	const [daysOff, setDaysOff] = useState([]);
	const [response, setResponse] = useState<string>('');
	// Model Catalog and first model in dropdown
	const [modelOptions, setModelOptions] = useState([]);
	const [selectedModel, setSelectedModel] = useState<Model>({});	//const { notification } = useNotification();
	const [helloUserResponse, isLoadingHelloUser] =
		useLoadingPixel<string>("HelloUser()");

	const [isLoading, setIsLoading] = useState(false);

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

	useEffect(() => {
		setIsLoading(true);
		//Grabbing all the Models that are in CfG
		let pixel = `MyEngines ( metaKeys = [] , metaFilters = [] , engineTypes = [ 'MODEL' ] );`;

		actions.run(pixel).then((response) => {
			const { output, operationType } = response.pixelReturn[0];

			if (operationType.indexOf('ERROR') > -1) {
				throw new Error(output as string);
			}
			if (Array.isArray(output)) {
				setModelOptions(output);
				setSelectedModel(output[0]);
			}
		});

		setIsLoading(false);
	}, []);

	const handleClick = () => {
		hiddenFileInput.current.click();
	};

	console.log("Selected Model: ", selectedModel);

	const generateResponse = async (daysOffList: any[]) => {

		const command = 'You are talking to a Parent about their child\'s schedule. Provide a summary of days off, and then go through each Month and say which days are off: ' + JSON.stringify(daysOffList);
		const query = `LLM(engine=["${selectedModel.database_id}"], command=["<encode>${command}</encode>"]);`

		try {
			await actions.run(query).then((resp) => {
				const { output, operationType } = resp.pixelReturn[0];

				if (operationType[0] !== 'ERROR') {
					setResponse((output as LLMResponse).response);
				}

			})
		} catch (e) {
			setResponse('An error occurred while generating the response. Please try again.');
		}
	}

	const handleUpload = async () => {
		const query = `UploadSchedule(FILE_PATH=${await uploadFiles(selectedFile)})`;
		try {
			await actions.run(query).then((response) => {
				const { output, operationType } = response.pixelReturn[0];

				if (operationType[0] !== 'ERROR') {
					generateResponse(output as any[]);
				}

			})

		} catch (e) {
			setResponse('An error occurred while uploading the schedule. Please try again.');
		}

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
			<Stack alignItems={'flex-start'} spacing={2}>
				<Autocomplete
					disableClearable
					options={modelOptions}
					value={selectedModel}
					getOptionLabel={(option: Model) => option.database_name}
					onChange={(event, newModel) => setSelectedModel(newModel)}
					renderInput={(params) => (
						<TextField {...params} label="Model" />
					)}
					sx={{ width: 300 }}
				/>
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
				<Stack mt={2} spacing={1}>
					<Typography variant="h6">Days Off:</Typography>
					{/* {daysOff.map((day, index) => (
							<p key={index}>
								{day}
							</p>
						))} */}
					{response && (
						<Typography variant="body1" mt={1}>
							<Markdown>{response}</Markdown>
						</Typography>
					)}
				</Stack>
			</Stack>
		</Stack>
	);
};
