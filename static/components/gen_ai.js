export default {
    template: `
      <div class="container-fluid">
        <h2>GenAI Pages</h2>
        <p>Team ID: {{ teamId }}</p>  
        <!-- Repository Structure and File Content Row -->
        <div class="row mt-4">
          
          <!-- Repository Structure Column -->
          <div class="col-md-4">
            <div class="card">
              <div class="card-body">
                <h3>Repository Structure</h3>
                
                <button v-if="currentPath" class="btn btn-secondary mb-2" @click="goBack">Back</button>
                
                <ul class="tree">
                  <tree-item
                    v-for="item in repoStructure"
                    :key="item.path"
                    :item="item"
                    @fetch-child-items="fetchChildItems"
                    @file-clicked="fetchFileContent"
                  ></tree-item>
                </ul>
              </div>
            </div>
          </div>
  
          <!-- File Content Column -->
          <div class="col-md-8">
            <div class="card">
              <div class="card-body">
                <h3>File Content</h3>
                <textarea class="form-control" v-if="fileContent" rows="20" readonly>{{ fileContent }}</textarea>
                <p v-else class="text-muted">Select a file to view its content.</p>
               
               
                <!-- GenAI Tool Input Form at the Bottom -->
                <div class="form-group mt-4">
                  <label for="prompt">Enter your query:</label>
                  <textarea id="prompt" class="form-control" v-model="userPrompt" rows="3" placeholder="Ask something about the file content..."></textarea>
                </div>
                
                <button class="btn btn-primary mt-2" @click="submitAnalysis">Submit</button>
                
                <div v-if="loading" class="mt-3 text-primary">Loading...</div>
                
                <div v-if="result" class="mt-3">
                <h4>Result:</h4>
                <!-- Wrap the result text in a div with appropriate classes for wrapping -->
                <div class="text-wrap overflow-auto" style="white-space: pre-wrap; word-wrap: break-word; max-height: 300px;">
                  {{ result }}
                </div>
              </div>
              
          
              
                </div>
            </div>
          </div>
          
        </div>
      </div>
    `,

    data() {
      return {
        teamId: null,
        userPrompt: '',
        result: null,
        loading: false,
        repoStructure: [],
        repoName: '',
        currentPath: '',
        fileContent: null // To store the content of the clicked file
      };
    },
    created() {
      this.teamId = this.$route.params.teamId;
      this.fetchTeamDetails(this.teamId);
    },
    methods: {

        async submitAnalysis() {
            this.loading = true;
            this.result = null;

            // Extract the file name from the currentPath
            const fileName = this.currentPath ? this.currentPath.split('/').pop() : '';
            console.log("File Name:", fileName); // Debugging log

            // Validate that fileName and fileContent are not empty
            if (!fileName || !this.fileContent) {
              console.error("Missing file name or file content.");
              this.loading = false;
              return;
            }

            try {
              const response = await fetch("/api/genai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  file_name: fileName,  // Send file_name along with content and user prompt
                  file_content: this.fileContent,
                  user_prompt: this.userPrompt
                })
              });

              if (response.ok) {
                const data = await response.json();
                this.result = data.result;
              } else {
                console.error("Failed to get AI analysis.");
              }
            } catch (error) {
              console.error("Error during AI analysis:", error);
            } finally {
              this.loading = false;
            }
          },


      async fetchTeamDetails(teamId) {
        try {
          const response = await fetch(`/api/teams/${teamId}`);
          if (response.ok) {
            const data = await response.json();
            this.repoName = data.repo.split("github.com/")[1]; 
            this.fetchRepoContents(); 
          } else {
            console.error("Failed to fetch team details.");
          }
        } catch (error) {
          console.error("Error fetching team details:", error);
        }
      },
      async fetchRepoContents(path = '') {
        this.currentPath = path; // Update current path
        const url = `https://api.github.com/repos/${this.repoName}/contents/${path}`;
        try {
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            this.repoStructure = data; // Store the fetched structure
          } else {
            console.error("Failed to fetch repository contents.");
          }
        } catch (error) {
          console.error("Error fetching repository contents:", error);
        }
      },
      async fetchChildItems(item) {
        if (item.type === 'dir') {
          await this.fetchRepoContents(item.path);
        }
      },
      async goBack() {
        const parentPath = this.currentPath.split('/').slice(0, -1).join('/');
        this.fetchRepoContents(parentPath); // Fetch contents of the parent directory
      },
      async fetchFileContent(filePath) {
        const url = `https://api.github.com/repos/${this.repoName}/contents/${filePath}`;
        try {
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            if (data.content) {
              this.fileContent = atob(data.content); // Assuming the file is text
              this.currentPath = filePath;  // Set the current path when a file is clicked
              console.log("Current Path:", this.currentPath); // Debugging log

            }
          } else {
            console.error("Failed to fetch file content.");
          }
        } catch (error) {
          console.error("Error fetching file content:", error);
        }
      },
    },
    components: {
      TreeItem: {
        props: ['item'],
        template: `
        <li class="tree-item">
        <div @click="toggle" class="tree-item-header">
          <span :class="['icon', item.type === 'dir' ? 'folder-icon' : 'file-icon']">
            <span v-if="item.type === 'dir'" :class="showChildren ? 'chevron-down' : 'chevron-right'">
              <!-- Arrow icon for directories -->
              <span class="dropdown-arrow">{{ showChildren ? '▼' : '▶' }}</span>
            </span>
            <span v-else>
              <!-- Dash for files -->
              <span class="file-icon-dash">-</span>
            </span>
            <img 
              v-if="item.type !== 'dir'" 
              :src="fileIcon(item.name)" 
              class="file-icon-image img-fluid" 
              width="16" 
              height="16" 
            />
          </span>
          <span @click.stop="handleFileClick(item.path)">{{ item.name }}</span>
        </div>
        <ul v-show="showChildren && item.children && item.children.length > 0" class="nested">
          <tree-item
            v-for="child in item.children"
            :key="child.path"
            :item="child"
            @fetch-child-items="$emit('fetch-child-items', child)"
            @file-clicked="$emit('file-clicked', child.path)"
          ></tree-item>
        </ul>
      </li>
      
        `,
        data() {
          return {
            showChildren: false,
          };
        },
        methods: {
          toggle() {
            if (this.item.type === 'dir') {
              this.showChildren = !this.showChildren;
              this.$emit('fetch-child-items', this.item);
            }
          },
          handleFileClick(filePath) {
            if (this.item.type !== 'dir') {
              this.$emit('file-clicked', filePath);
            }
          },
          fileIcon(name) {
            const extension = name.split('.').pop();
            switch (extension) {
              case 'js':
                return 'https://cdn-icons-png.flaticon.com/512/888/888855.png'; // JavaScript icon
              case 'html':
                return 'https://cdn-icons-png.flaticon.com/512/732/732212.png'; // HTML icon
              case 'css':
                return 'https://cdn-icons-png.flaticon.com/512/732/732190.png'; // CSS icon
              case 'md':
                return 'https://cdn-icons-png.flaticon.com/512/2111/2111621.png'; // Markdown icon
              case 'json':
                return 'https://cdn-icons-png.flaticon.com/512/732/732212.png'; // JSON icon (same as HTML)
              case 'txt':
                return 'https://cdn-icons-png.flaticon.com/512/895/895276.png'; // Text file icon
              case 'pdf':
                return 'https://cdn-icons-png.flaticon.com/512/337/337946.png'; // PDF file icon
              case 'png':
                return 'https://cdn-icons-png.flaticon.com/512/3643/3643285.png'; // PNG file icon
              case 'jpg':
              case 'jpeg':
                return 'https://cdn-icons-png.flaticon.com/512/3643/3643297.png'; // JPG file icon
              case 'php':
                return 'https://cdn-icons-png.flaticon.com/512/3497/3497462.png'; // PHP icon
              default:
                return 'https://cdn-icons-png.flaticon.com/512/1783/1783600.png'; // Default icon for other file types
            }
          },
        },
      },
    },
  };