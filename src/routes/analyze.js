const axios = require('axios')
const router = require('express').Router()
const multer = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const resultsDir = process.env.UPLOADS_HOME || "./data/uploads"
    const resultsPath = `${resultsDir}/${Date.now()}`
    console.log("Upload on", resultsPath)
    fs.mkdirSync(resultsPath, { recursive: true })
    cb(null, resultsPath)
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

const upload = multer({storage: storage})

router.post('/', upload.single("binary"), (req, res) => {
  console.log("Analyzing file:", req.file)
  const app = JSON.parse(req.body.app)
  const { appName, packageName, version, tests } = app
  const { url, metadata } = app.data

  console.log("Parameters received:", appName)
  console.log("Parameters received:", tests)

  if(appName == null || appName == "") res.send(400).send({ message: "appName name cannot be null or empty" });
  else if(packageName == null || packageName == "") res.send(400).send({ message: "packageName name cannot be null or empty" });
  else if(version != null && version == "") res.send(400).send({ message: "version name cannot be null or empty" });
  else if(url != null && url == "") res.send(400).send({ message: "url name cannot be null or empty" });
  else if(metadata != null && metadata == "") res.send(400).send({ message: "metadata name cannot be null or empty" });
  else if(tests != null && tests.length == 0) res.send(400).send({ message: "tests name cannot be null or empty" });
  else {
    setTimeout(() => execute(appName, packageName, version, tests), 1 * 1000)
    res.status(200).send()
  }
})

const execute = (appName, packageName, version, tests) => {
  const resultsEndpoint = process.env.DELIVER_RESULTS_ENDPOINT || "http://localhost:3000/api/result"
  console.log("Responde to server");
  axios.put(resultsEndpoint, {
    appName: appName,
    packageName: packageName,
    version: version,
    timestamp: Date.now(),
    results: doTests(tests)
  })
  .catch(error => console.log("Error:", error))
}

const doTests = (tests) => {
  //const timeoutStart = Date.now()
  var testTime = 0
  //console.log("Test time (ms): " + (Date.now() - timeoutStart) ) // Test time in seconds
  //console.log("Test time (minutes): " + (Date.now() - timeoutStart) / 1000 / 60) // Test time in minutes
  return tests.map(test => ({
    name: test.name,
    parameters: test.parameters,
    result: Math.floor(Math.random() * (100 - 10 + 1) + 10),
    unit: "detections",
    optional: testTime.toFixed(3),
  }))
}

module.exports = router
