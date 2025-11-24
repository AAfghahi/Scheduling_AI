import { useRef, type ChangeEvent } from 'react';
import { Box, Button, Container, IconButton, Input, Stack, styled, Typography } from '@mui/material';
import { OpenInBrowserOutlined, DeleteOutline, DownloadOutlined } from '@mui/icons-material';

const StyledBox = styled(Box)(({ theme }) => ({
    width: 'auto',
    borderRadius: '5px',
    border: `1px dashed ${theme.palette.grey[300]}`,
    backgroundColor: 'white',
    padding: 16,
}));

const StyledText = styled(Typography)(({ theme }) => ({
    color: '#757575',
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeightRegular,
}));

const StyledContainer = styled(Box)({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    columnGap: 1,
    paddingLeft: 5,
    paddingTop: 10,
    boxSizing: 'border-box',
    fontSize: '12px',
});

const StyledButton = styled(Button)(() => ({
    '&:hover': {
        backgroundColor: 'unset!important',
    },
    textTransform: 'capitalize',
    color: 'primary',
}));


const StyledIconButton = styled(IconButton)(({ theme }) => ({
    backgroundColor: `${theme.palette.primary.main}1D`,
    color: theme.palette.primary.main,
}));

export interface UploadBoxProps {
    file: File | null;
    setFile: (file: File | null) => void;
    policyText: String;
}

export const UploadBox = ({ file, setFile, policyText }: UploadBoxProps) => {

    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    return (
        <Container sx={{ marginBottom: 0 }}>
            <StyledBox
                onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                }}>
                <Stack justifyContent='center' alignItems='center' padding={1}>
                    <StyledText variant='body1' align='center' sx={{ paddingBottom: 2 }}>
                        {policyText}
                    </StyledText>
                    <StyledIconButton
                        onClick={(e) => {
                            e.stopPropagation();
                            inputRef.current?.click();
                        }}
                    >
                        <OpenInBrowserOutlined />
                    </StyledIconButton>
                    <StyledButton>
                        Browse
                    </StyledButton>
                    <Input
                        type="file"
                        inputRef={inputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                        inputProps={{ accept: '.xlsx' }}
                    />
                </Stack>
            </StyledBox>
            {file?.name && (
                <StyledContainer sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <DownloadOutlined sx={{ color: '#757575' }} />
                        <StyledText>
                            {file?.name}
                        </StyledText>
                    </Box>
                    <IconButton onClick={() => {
                        setFile(null);
                        // reset ref to be able to upload again
                        if (inputRef.current) {
                            inputRef.current.value = '';
                        };
                    }}>
                        <DeleteOutline sx={{ width: 20, height: 30, color: '#757575' }} />
                    </IconButton>
                </StyledContainer>
            )}
        </Container>
    );
};