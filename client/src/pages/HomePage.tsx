import { Button, Stack, Typography, Autocomplete, TextField, Container, IconButton, Tooltip } from "@mui/material";
import { useState, useEffect } from "react";
import { useInsight } from "@semoss/sdk/react";
import { Model, LLMResponse } from "./constants";
import { Markdown } from "@/components";
import { UploadBox } from "@/components/base/UploadBox";
import { AutoAwesome } from "@mui/icons-material";
import { Insight } from "@semoss/sdk";


export const HomePage = () => {

	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const { actions, isReady } = useInsight();
	const [daysOff, setDaysOff] = useState([]);
	const [response, setResponse] = useState<string>('');
	const [modelOptions, setModelOptions] = useState([]);
	const [selectedModel, setSelectedModel] = useState<Model>({});	
	//const { notification } = useNotification();
	const [isLoading, setIsLoading] = useState(false);
	const [isModelSelect, setIsModelSelect] = useState(false);


	const uploadFiles = async (file): Promise<string> => {
		const fileLocations: string[] = [];
		try {
			const response = await actions.upload(file, '');
			const fileLocation = `${response[0].fileLocation.replace(/^\//, '',)}`;
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

	const handleSubmit = async () => {
        try {
			const insight = new Insight();
			const init = await insight.initialize();
			if(init.tool) {
				const { output } = await actions.runMCPTool(init.tool?.name, {
                "FILE_PATH": await uploadFiles(selectedFile),
            });
            	console.log({ output });

			} else {
				handleUpload();
			}
           
        } catch (err) {
            console.error(err);
        }
    };

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
		<Container maxWidth="md">
			<Stack spacing={2} sx={{ alignItems: "center", padding: 4 }}>
				<Typography variant="h4">Schedule Uploader</Typography>
				<UploadBox file={selectedFile} setFile={setSelectedFile} policyText={"Click to upload your child's schedule in .xlsx format."} />
				<Stack alignItems={'center'} spacing={2} direction={'row'}>
					<Button
						variant="contained"
						onClick={() => handleSubmit()}
						disabled={selectedFile == null || selectedModel.database_id == null}
					>
						Upload Schedule
					</Button>
					<Tooltip title="Select Model">
						<IconButton
							onClick={() => setIsModelSelect(!isModelSelect)}
							color={selectedModel ? "primary" : "default"}
						>
							<AutoAwesome />
						</IconButton>
					</Tooltip>
					{isModelSelect && (
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
					)}
				</Stack>
				<Stack spacing={1} alignItems={'center'}>
					{response && (
						<Stack>
							<Typography variant="h6">Days Off:</Typography>
							{/* {daysOff.map((day, index) => (
								<p key={index}>
									{day}
								</p>
							))} */}
							<Typography variant="body1" mt={1}>
								<Markdown>{response}</Markdown>
							</Typography>
						</Stack>
					)}
				</Stack>
			</Stack>
		</Container>
	);
};
