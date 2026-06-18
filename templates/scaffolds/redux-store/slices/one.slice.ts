import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  /*  
   status: "idle" | "loading" | "error" | "success",  
  */
  oneData: "",
  error: "",
  status: "idle",
  isLoading: false,
  isError: false,
  meta: {
    requiresAuth: true,
  },
};

/* 

import { createAsyncThunk } from "@reduxjs/toolkit";

# NOTE : it can also have asyncThunks to handle async logic like api calls

export const oneAsync = createAsyncThunk(
  "one/oneAsync",
  async (_ ,{rejectWithValue,signal}) => {
    try {
      const response = await axios.get("backend_api_route",{signal});  
      return response.data;
    } catch (error:any) {
      return rejectWithValue(error.response.data);
    }
  }
);

----------------------------------------------------------------
(method 1)
# NOTE : and use it 

const dispatch = useAppDispatch();

const [isLoading, setIsLoading] = useState(false);
const handleClick = async () => {
  try {
      setIsLoading(true);
    const data = await dispatch(oneAsync()).unwrap();
    console.log(data);
  } catch (error) {
    console.log(error);
  }finally{
    setIsLoading(false);
    dispatch(setStatus("idle"));

  }
};



----------------------------------------------------------------
(method 2)
# NOTE : other way to call it by using the slice state variable to store data in that and call from there 

in this case we call it via useSelector to get the data

useEffect(() => {
  dispatch(oneAsync());
}, [dispatch]);


-----------------------------------------------------------------
# NOTE :

const {status,isloading,isError} = useOne();

useEffect(() => {
 if(status === "idle"){
  dispatch(oneAsync());
 }
}, [dispatch]);

in this either i manlually make status idel again to dispatch 

or 

useEffect(() => {
  dispatch(fetchUsers(page));
}, [page, dispatch]);

use page for some kind of trigger that keep preventing from unwanted api calls

only a page reload or setting the status manually to idle will make the api call again

# NOTE : this above can be also done in (method 1) of calling by removing useState or we can make useState for api loading/error/status etc but that is messy and cannot be handel outside comp or doing it inside hook is also not good as each hook call is treated as new instance  so best way is to either make inital states and handel via reducers custom ones or use extra reducers which is the best way to handel this. only one thing we can do is spread our manipulation data across 3/4 different steps 
1. inside fullfill extra reducer (for heavy manipulation)
2. inside selector (memoised data can do some manipulation )
3. inside hook (optional or for component specifics extraction or manipulation)
4. inside component (optional for specific element or ui level requirement)

there is another way of data flow 

1. call api , do heavy manipulation in fullfilled state, store data in state
2. call data in hook (for comp based manipulation further can use useMemo here to avoid unwanted processing of same data)
3. call in component (if required do further manipulation )

useMemo only preserve manipulated data to save manipulation from rerendering of the component itself not unmount / mount of comp 

in mounting useMemo / hook will lose instances and cached data is destroyed 

When createSelector is useful
When you want to keep raw data in Redux.
*/

const oneSlice = createSlice({
  name: "one",
  initialState,

  // Manually handling async logic via reducers
  reducers: {
    setOne: (state, action) => {
      state.oneData = action.payload;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setError: (state, action) => {
      state.isError = true;
      state.error = action.payload;
      state.status = "error";
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
      state.status = "pending";
      state.isError = false;
      state.error = "";
    },

    /*

    there is 2 ways to make a async call in redux

    1. Manually handling async logic via reducers
    2. Using extraReducers

    usually we use extra reducers because is easy what more we can use is use status state for preventing unwnted api calls



    # NOTE : extraReducers are used to handle async logic like api calls
    extrareducers : {
        builder
        .addCase(oneAsync.pending, (state) => {
                state.isLoading = true;
            })
        .addCase(oneAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                const processedData = action.payload;
                // here manipulates data accordingly and handover to selector.
                state.oneData = processedData;
                state.status = "idle";
            })
        .addCase(oneAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.error = action.payload;
                state.status = "error";
            })
    }

    */
  },
});

export const { setOne } = oneSlice.actions;
export default oneSlice.reducer;

/* 

a slice has state, reducers, and actions.
a state => data 
a reducers => logic on how data changes / basically data manipulation
a actions => dispatchers to change the data

------------------------------------------------------------
# NOTE : to dispatch an action

import { useDispatch } from "react-redux";
import { setOne } from "../slices/one.slice";
const dispatch = useDispatch();
dispatch(setOne("hello"));

its basically calling the function defined in reducers with the data

------------------------------------------------------------
# NOTE : to call a state to get the data in comp we 

import { useSelector } from "react-redux";
import { type RootState } from "../index";
const one = useSelector((state: RootState) => state.one.oneData);

this is basically accessing the value from the store.


*/
