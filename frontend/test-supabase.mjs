import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ngbqhkqoazneombiczo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nYnFoa3FvYXpuZW9lbWJpY3pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxODQ0NTYsImV4cCI6MjA4Nzc2MDQ1Nn0.hqWYxe4jrk-b5qZBtER2qpdaJJd6F6PJdIOsD7s5VXo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    console.log('Testing Supabase connection...');
    try {
        const { data, error } = await supabase.auth.signUp({
            email: 'test' + Date.now() + '@example.com',
            password: 'StrongPassword123!',
            options: {
                data: {
                    full_name: 'Test Setup'
                }
            }
        });

        if (error) {
            console.error('Connection failed (Supabase Error):', error);
        } else {
            console.log('Connection successful!', data);
        }
    } catch (err) {
        console.error('Network or other catch error:', err);
    }
}

testConnection();
