const footers = Vue.component("footers", {
    template: `
           <div>
          <footer style="
            background-color: #F0E6F6; /* Very light purple color */
            color: black; 
            text-align: center; 
            padding: 10px 0; 
            position: fixed; 
            bottom: 0; 
            width: 100%;
          ">
            <div class="container">
              <span>&copy; 2024 Project Management App. All rights reserved.</span>
            </div>
          </footer>
        </div>
          `,
  });
  
  export default footers;
  