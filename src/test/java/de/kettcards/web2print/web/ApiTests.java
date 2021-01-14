package de.kettcards.web2print.web;

import org.json.*;
import org.junit.jupiter.api.*;

import java.io.*;
import java.net.*;
import java.nio.file.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.function.Function;

public class ApiTests {
  final static String API_URL = "http://localhost:8080/web2print/api";

  private HttpURLConnection makeRequest(String apiSlug) throws IOException {
    var url = new URL(API_URL + apiSlug);
    var con = (HttpURLConnection)url.openConnection();
    con.setRequestMethod("GET");

    return con;
  }

  void recurse(File folderPath, String path, ArrayList<DynamicTest> tests, Function<String, DynamicTest> testProvider) {
    for (var entry : folderPath.listFiles()) {
      var ep = path + "/" + entry.getName();
      if(entry.isDirectory())
        recurse(entry, ep, tests, testProvider);
      else {
        var dotPos = ep.lastIndexOf('.');
        if(dotPos > -1 && dotPos < ep.length() - 2)
          ep = ep.substring(0, dotPos);
        tests.add(testProvider.apply(ep));
      }
    }
  }

  void endpointAvailabilityTest(String endpoint) throws IOException {
    var conn = makeRequest(endpoint);

    var responseCode = conn.getResponseCode();
    Assertions.assertEquals(200, responseCode, "expected 200 response for '"+endpoint+"' but got ["+responseCode+"] : "+conn.getResponseMessage());

    conn.disconnect();
  }

  @TestFactory
  Collection<DynamicTest> endpointAvailabilityTestFactory() {
    var tests = new ArrayList<DynamicTest>();
    recurse(new File("./src/test/test_input/"), "", tests,
        (ep) -> DynamicTest.dynamicTest("API endpoint value test [" + ep + "]", () -> endpointAvailabilityTest(ep))
    );
    return tests;
  }

  private void validate(Object o1, Object o2) throws JSONException {
    Assertions.assertEquals(o1.getClass(), o2.getClass(), "object classes are not the same type. values: '"+o1.toString()+"' vs '"+o2.toString()+"'");

    if(o1 instanceof JSONObject)
      validateJO((JSONObject)o1, (JSONObject)o2);
    else if (o1 instanceof JSONArray) {
      validateJA((JSONArray)o1, (JSONArray)o2);
    } else {
      Assertions.assertEquals(o1, o2);
    }
  }

  private void validateJO(JSONObject j1, JSONObject j2) throws JSONException {
    var j1Names = j1.names();
    var j2Names = j2.names();
    Assertions.assertEquals(j1Names.length(), j2Names.length(), "objects have different amount of fields");

    for(int i = 0; i < j1Names.length(); i++)
      Assertions.assertEquals(j1Names.get(i), j2Names.get(i), "field names at index"+i+" differ");

    for(int i = 0; i < j1Names.length(); i++) {
      var field = j1Names.getString(i);
      var fieldValJ1 = j1.get(field);
      var fieldValJ2 = j2.get(field);
      Assertions.assertEquals(fieldValJ1.getClass(), fieldValJ2.getClass(), "fields at index "+i+" dont have the same type");

      validate(fieldValJ1, fieldValJ2);
    }
  }

  private void validateJA(JSONArray j1, JSONArray j2) throws JSONException {
    Assertions.assertEquals(j1.length(),  j2.length(), "arrays are not the same length");

    for(int i = 0; i < j1.length(); i++){
      var val1 = j1.get(i);
      var val2 = j2.get(i);
      Assertions.assertEquals(val1.getClass(), val2.getClass(), "array entries at index "+i+" dont have the same type");

      validate(val1, val2);
    }
  }

  @Test
  void testValidate() throws JSONException {
    var j1 = new JSONObject("{  \"j\": 6 }");
    var j2 = new JSONObject("{    \"j\":   6 }");

    validate(j1, j2);
  }

  void endpointValueTest(String endpoint) throws IOException, JSONException {
    System.out.println("test for endpoint '"+endpoint+"'");

    var targetString = Files.readString(Path.of("./src/test/test_input/" + endpoint + ".json").toAbsolutePath());
    var target = new JSONTokener(targetString).nextValue();

    var conn = makeRequest(endpoint);
    try {
      String responseString;
      try(var s = conn.getInputStream()) {
        try (var ir = new InputStreamReader(s, StandardCharsets.UTF_8)) {
          try (var reader = new BufferedReader(ir)) {
            var sb = new StringBuilder();
            String str;
            while((str = reader.readLine()) != null){
              sb.append(str);
            }
            responseString = sb.toString();
          }
        }
      }
      var response = new JSONTokener(responseString).nextValue();
      validate(target, response);
    } finally {
      conn.disconnect();
    }
  }

  @TestFactory
  Collection<DynamicTest> endpointValuesTestFactory() {
    var tests = new ArrayList<DynamicTest>();
    recurse(new File("./src/test/test_input/"), "", tests,
        (ep) -> DynamicTest.dynamicTest("API endpoint value test [" + ep + "]", () -> endpointValueTest(ep))
    );
    return tests;
  }
}