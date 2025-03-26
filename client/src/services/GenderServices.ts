import AxiosInstance from "../AxiosInstance";

const GenderServices = {
    storeGender: async (data: any) => {
        return AxiosInstance.post('/storeGender', data ).then((response) => {response}).catch((error) => {throw error});
    },
};

export default GenderServices;