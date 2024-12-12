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
          
          <!-- Submit Report Card with Bootstrap styles for shadow and background -->
          <div class="card mt-4 shadow-lg bg-light p-3 mb-4">
            <div class="card-body">
              <h3>Submit Report</h3>
              <form @submit.prevent="submitReport">
                <div class="mb-3">
                  <label for="scoreAnalysis" class="form-label">Score from Analysis</label>
                  <input
                    v-model="reportData.scoreAnalysis"
                    type="number"
                    class="form-control"
                    id="scoreAnalysis"
                    placeholder="Enter score from analysis"
                  />
                </div>
                <div class="mb-3">
                  <label for="scoreRate" class="form-label">Score from Rate</label>
                  <input
                    v-model="reportData.scoreRate"
                    type="number"
                    class="form-control"
                    id="scoreRate"
                    placeholder="Enter score from rate"
                  />
                </div>
                <div class="mb-3">
                  <label for="feedback" class="form-label">Feedback</label>
                  <textarea
                    v-model="reportData.feedback"
                    class="form-control"
                    id="feedback"
                    rows="4"
                    placeholder="Feedback will appear here"
                  ></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Submit</button>
              </form>
            </div>
          </div>
        </div>


        <!-- File Content Column (Full Width) -->
        <div class="col-md-8">
          <div class="card">
            <div class="card-body">
              <h3>File Content</h3>
              <textarea class="form-control" v-if="fileContent" rows="20" readonly>{{ fileContent }}</textarea>
              <p v-else class="text-muted">Select a file to view its content.</p>
             
              <!-- GenAI Tool Buttons for Analysis -->
              <div class="button-group mt-2">
                <button class="btn btn-primary mt-2" @click="submitAnalysis('summarize')">Summarize</button>
                <button class="btn btn-primary mt-2" @click="submitAnalysis('analyze')">Analyze</button>
                <button class="btn btn-primary mt-2" @click="submitAnalysis('rate')">Rate</button>
                <button class="btn btn-primary mt-2" @click="submitAnalysis('feedback')">Feedback</button>
              </div>
              
              <div v-if="loading" class="mt-3 text-primary">Loading...</div>
              
              <div v-if="result" class="mt-3">
                <h4>Result:</h4>
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
      result: null,
      loading: false,
      repoStructure: [],
      repoName: '',
      currentPath: '',
      fileContent: null, // To store the content of the clicked file
      reportData: {
        scoreAnalysis: null,
        scoreRate: null,
        feedback: ''
      }, // To store data for the report form
    };
  },
  created() {
    this.teamId = this.$route.params.teamId;
    this.fetchTeamDetails(this.teamId);
    // Load stored data from localStorage if available
    const storedReport = JSON.parse(localStorage.getItem('reportData'));
    if (storedReport) {
      this.reportData = storedReport;
    }
  },
  watch: {
    reportData: {
      deep: true,
      handler(newReportData) {
        localStorage.setItem('reportData', JSON.stringify(newReportData));
      }
    }
  },
  methods: {
    async submitAnalysis(task) {
      this.loading = true;
      this.result = null;
    
      // Extract the file name from the currentPath
      const fileName = this.currentPath ? this.currentPath.split('/').pop() : '';
    
      // Validate that fileName, fileContent, and task are not empty
      if (!fileName || !this.fileContent || !task) {
        this.result = "Please select a file and try again.";
        console.error("Missing file name, file content, or task.");
        this.loading = false;
        return;
      }
    
      try {
        const response = await fetch("/api/genai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file_name: fileName,
            file_content: this.fileContent,
            task: task  // Send the task to specify the action on backend
          })
        });
    
        if (response.ok) {
          const data = await response.json();
          this.result = data.result;
    
          // Extract the score (assuming it starts with "Your score: ")
          const scoreMatch = this.result.match(/Your score:\s*([\d\.]+)/);
          if (scoreMatch) {
            const score = parseFloat(scoreMatch[1]);
            if (task === 'rate') {
              this.reportData.scoreRate = score; // Store score in 'scoreRate'
            } else if (task === 'analyze') {
              this.reportData.scoreAnalysis = score; // Store score in 'scoreAnalysis'
            }
          }
          if (task === 'feedback') {
            this.reportData.feedback = this.result;
          }
    
        } else {
          const errorData = await response.json();
          this.result = errorData.error || "Failed to get AI analysis.";
          console.error("AI analysis error:", errorData);
        }
      } catch (error) {
        console.error("Error during AI analysis:", error);
        this.result = "An unexpected error occurred. Please try again.";
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
      const headers = {};
    
      // Check for GitHub token in localStorage
      const token = localStorage.getItem('github_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    
      try {
        const response = await fetch(url, { headers });
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
      const headers = {};
    
      // Check for GitHub token in localStorage
      const token = localStorage.getItem('github_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    
      try {
        const response = await fetch(url, { headers });
        if (response.ok) {
          const data = await response.json();
          if (data.content) {
            this.fileContent = atob(data.content); // Decode base64 content
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
    
    async submitReport() {
      try {
        const response = await fetch('/api/submit-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.reportData)
        });

        if (response.ok) {
          alert('Report submitted successfully!');
          localStorage.removeItem('reportData');
          this.reportData = {
            scoreAnalysis: null,
            scoreRate: null,
            feedback: ''
          };
        } else {
          alert('Failed to submit report. Please try again.');
        }
      } catch (error) {
        console.error('Error submitting report:', error);
        alert('An error occurred. Please try again.');
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