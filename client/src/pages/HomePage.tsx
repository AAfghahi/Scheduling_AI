import { Button, Stack, Typography, Autocomplete, TextField, Container, IconButton, Tooltip, Box, Tabs, Tab } from "@mui/material";
import { useState, useEffect } from "react";
import { useInsight } from "@semoss/sdk/react";
import { Model, LLMResponse } from "./constants";
import { Markdown } from "@/components";
import { UploadBox } from "@/components/base/UploadBox";
import { AutoAwesome, CheckCircle } from "@mui/icons-material";
import { Insight } from "@semoss/sdk";


export const HomePage = () => {

	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const { actions, isReady } = useInsight();
	const [parentDaysOff, setParentDaysOff] = useState([]);
	const [childDaysOff, setChildDaysOff] = useState([]);
	const [comparedDaysOff, setComparedDaysOff] = useState([]);
	const [response, setResponse] = useState<string>('');
	const [modelOptions, setModelOptions] = useState([]);
	const [selectedModel, setSelectedModel] = useState<Model>({});	
	//const { notification } = useNotification();
	const [isLoading, setIsLoading] = useState(false);
	const [isModelSelect, setIsModelSelect] = useState(false);
	const [activeTab, setActiveTab] = useState(0);


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

	const handleSubmit = async (type) => {
        try {
			const insight = new Insight();
			const init = await insight.initialize();
			if(init.tool) {
				const { output } = await actions.runMCPTool(`Upload${type}Schedule`, {
                "FILE_PATH": await uploadFiles(selectedFile),
            });
				type === "Parent" ? setParentDaysOff(output as unknown as any[]) : setChildDaysOff(output as unknown as any[]);
            	console.log({ output });

			} 
        } catch (err) {
            console.error(err);
        }
    };

	const compareDays = async () => {
		const query = `CompareDaysOff(PARENT_DAYS_OFF=${JSON.stringify(parentDaysOff)}, CHILD_DAYS_OFF=${JSON.stringify(childDaysOff)});`;
		try {
			await actions.run(query).then((response) => {
				const { output, operationType } = response.pixelReturn[0];

				if (operationType[0] !== 'ERROR') {
					setComparedDaysOff(output as any[]);
				}

			})

		} catch (e) {
			setResponse('An error occurred while comparing days off. Please try again.');
		}

	};

	const compare = async () => {
        try {
			const insight = new Insight();
			const init = await insight.initialize();
			if(init.tool) {
				const { output } = await actions.runMCPTool(`CompareDaysOff`, {
                "PARENT_DAYS_OFF": parentDaysOff,
				"CHILD_DAYS_OFF": childDaysOff,
            });
            	console.log({ output });

			} 
           
        } catch (err) {
            console.error(err);
        }
    };

	const generateResponse = async (calendarType: string, daysOffList: any[]) => {

		const command = 'You are parsing ' + calendarType + 's schedule. Provide a summary of days off, and then go through each Month and say which days are off: ' + JSON.stringify(daysOffList);
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

	const handleUpload = async (type: "Parent" | "Child") => {
		const query = `Upload${type}Schedule(FILE_PATH="${await uploadFiles(selectedFile)}")`;
		try {
			await actions.run(query).then((response) => {
				const { output, operationType } = response.pixelReturn[0];
				type === "Parent" ? setParentDaysOff(output as any[]) : setChildDaysOff(output as any[]);

				if (operationType[0] !== 'ERROR') {
					//generateResponse(type, output as any[]);
					console.log('output', output as unknown as string);
					actions.sendMCPResponseToPlayground(output as unknown as string);
				}

				setSelectedFile(null);

			})

		} catch (e) {
			console.error(e);
			setResponse('An error occurred while uploading the schedule. Please try again.');
		}

	};

	const scheduleType = activeTab === 0 ? "Parent" : "Child";

	return (
		<Container maxWidth="md">
			<Stack spacing={2} sx={{ alignItems: "center", padding: 4 }}>
				<Typography variant="h4">Schedule Uploader</Typography>
				{/* Tabs for Parent/Child */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '80%' }}>
                    <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} centered>
                        <Tab 
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <span>Parent Schedule</span>
                                </Stack>
                            } 
                        />
                        <Tab 
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <span>Child Schedule</span>
                                </Stack>
                            } 
                        />
                    </Tabs>
                </Box>
				<UploadBox file={selectedFile} setFile={setSelectedFile} policyText={`Click to upload ${scheduleType} schedule in .xlsx format.`} />
				<Stack alignItems={'center'} spacing={2} direction={'row'}>
					<Button
						variant="contained"
						onClick={() => handleUpload(scheduleType)}
						disabled={selectedFile == null || selectedModel.database_id == null}
					>
						Upload {scheduleType} Schedule
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
				<br />
				{/* <Stack spacing={1} alignItems={'center'}>
					{parentDaysOff.length > 0 && childDaysOff.length > 0 && (
						<Button
							variant="contained"
							onClick={compareDays}
							disabled={parentDaysOff.length === 0 || childDaysOff.length === 0}
						>
							Compare Days Off
						</Button>
					)}
				</Stack> */}
			</Stack>
		</Container>
	);
};
