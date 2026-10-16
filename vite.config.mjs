import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

// Relative assets work at both / and a repository path such as /upcoming/.
export default defineConfig({base:'./',plugins:[react()],server:{host:'127.0.0.1'},preview:{host:'127.0.0.1'},build:{chunkSizeWarningLimit:800}});
