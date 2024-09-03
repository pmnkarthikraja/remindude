import axios, { AxiosResponse } from "axios"

export interface CalenderHoliday{
    name:string,
    description:string,
    country:{
        id:string,
        name:string,
    },
    date:{
        iso:string,
        datetime:{
            year:string,
            month:string,
            day:string
        }
    },
    type:[string],
    urlid:string,
    primary_type:string
}

export interface HolidayData{
  country:string,
  holidays:CalenderHoliday[],
  year:number,
  _id:string
}

type Region = 'India' | 'Saudi Arabia'|'Both'

export interface LocalHolidayData{
  _id?:string,
  iso_date:string,
  holidayName:string,
  region:Region
}

`sample dataset
{
        "name": "Republic Day",
        "description": "India's Republic Day marks the anniversary of the adoption of the Indian constitution. It is an annual gazetted holiday in India on January 26.",
        "country": {
          "id": "in",
          "name": "India"
        },
        "date": {
          "iso": "2024-01-26",
          "datetime": {
            "year": 2024,
            "month": 1,
            "day": 26
          }
        },
        "type": [
          "National holiday"
        ],
        "primary_type": "Gazetted Holiday",
        "canonical_url": "https://calendarific.com/holiday/india/republic-day",
        "urlid": "india/republic-day",
        "locations": "All",
        "states": "All"
      },
`
// const BASE_URL=process.env.NODE_ENV==='production' ? "https://remindude.vercel.app" :  "http://localhost:4000"
const BASE_URL=process.env.NODE_ENV==='production' ? "https://remindude-backend.onrender.com" :  "http://localhost:4000"


class CalenderHolidayApiService {
    async getHolidays ():Promise<HolidayData[]>{
        const res = await axios.get(`${BASE_URL}/holidays`)
        return res.data.holidayData
    }
    async getLocalHolidays ():Promise<LocalHolidayData[]>{
      const res = await axios.get(`${BASE_URL}/local-holidays`)
      return res.data.localHolidays
    }
    async upsertLocalHolidays (holidays:LocalHolidayData[]):Promise<{
      message:string,
      success:boolean
    }>{
      const res = await axios.post(`${BASE_URL}/local-holidays`,{
        holidays
      })
      return res.data
    }
    async deleteLocalHoliday (_id:string):Promise<{
      message:string,
      success:boolean
    }>{
      const res = await axios.delete(`${BASE_URL}/local-holidays/${_id}`)
      return res.data
    }
}

export const holidayApi = new CalenderHolidayApiService()