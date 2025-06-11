import api from "./api";

export const searchJobs = async (search) => {
    try {
        console.log(`🔍 Calling searchJobs API for: "${search}"`);
        const response = await api.get("/mission/search", { params: { q: search } });
        
        console.log("✅ searchJobs API response received:", response);
        console.log("📦 searchJobs response.data:", response.data);
        
        // FIX: Handle nested data structure
        let jobsArray = [];
        
        if (Array.isArray(response.data)) {
            // Direct array
            jobsArray = response.data;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
            // Nested in .data property - THIS IS YOUR CASE
            jobsArray = response.data.data;
            console.log("✅ Found jobs in response.data.data:", jobsArray.length);
        } else {
            console.warn("⚠️ Unexpected response structure:", response.data);
            jobsArray = [];
        }
        
        console.log(`📈 Returning ${jobsArray.length} jobs`);
        return jobsArray;
        
    } catch (error) {
        console.error("❌ searchJobs API error:", error);
        return [];
    }
};

export const searchFreelancers = async (search) => {
    try {
        console.log(`🔍 Calling searchFreelancers API for: "${search}"`);
        const response = await api.get("/freelancer/search", { params: { q: search } });
        
        // DETAILED DEBUGGING - Let's see EXACTLY what's coming back
        console.log("========== FREELANCERS API DEBUG ==========");
        console.log("✅ Full response object:", response);
        console.log("📦 response.data:", response.data);
        console.log("📊 response.data type:", typeof response.data);
        console.log("🔢 response.data is array:", Array.isArray(response.data));
        
        // Check if data is nested
        if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
            console.log("🔍 response.data is object, checking properties:");
            Object.keys(response.data).forEach(key => {
                console.log(`  - ${key}:`, response.data[key], `(type: ${typeof response.data[key]}, isArray: ${Array.isArray(response.data[key])})`);
            });
        }
        
        // Try multiple extraction strategies
        let freelancersArray = [];
        
        if (Array.isArray(response.data)) {
            console.log("✅ Found direct array");
            freelancersArray = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
            console.log("✅ Found array in response.data.data");
            freelancersArray = response.data.data;
        } else if (response.data?.freelancers && Array.isArray(response.data.freelancers)) {
            console.log("✅ Found array in response.data.freelancers");
            freelancersArray = response.data.freelancers;
        } else if (response.data?.talents && Array.isArray(response.data.talents)) {
            console.log("✅ Found array in response.data.talents");
            freelancersArray = response.data.talents;
        } else if (response.data?.results && Array.isArray(response.data.results)) {
            console.log("✅ Found array in response.data.results");
            freelancersArray = response.data.results;
        } else if (response.data?.users && Array.isArray(response.data.users)) {
            console.log("✅ Found array in response.data.users");
            freelancersArray = response.data.users;
        } else {
            console.warn("⚠️ Could not find freelancers array in response");
            console.log("Available keys:", Object.keys(response.data || {}));
            
            // Last resort: look for any array in the response
            const foundArray = Object.values(response.data || {}).find(val => Array.isArray(val));
            if (foundArray) {
                console.log("🔧 Found array in unknown property:", foundArray);
                freelancersArray = foundArray;
            }
        }
        
        console.log(`📈 FINAL: Returning ${freelancersArray.length} freelancers`);
        if (freelancersArray.length > 0) {
            console.log("📋 Sample freelancer:", freelancersArray[0]);
        }
        console.log("==========================================");
        
        return freelancersArray;
        
    } catch (error) {
        console.error("❌ searchFreelancers API error:", error);
        return [];
    }
};