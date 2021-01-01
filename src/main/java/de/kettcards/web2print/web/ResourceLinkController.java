package de.kettcards.web2print.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.kettcards.web2print.config.Web2PrintApplicationConfiguration;
import de.kettcards.web2print.model.Include;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
public class ResourceLinkController {

    @Autowired
    private Web2PrintApplicationConfiguration configuration;

    @Autowired
    private ObjectMapper objectMapper;

    @SneakyThrows
    @GetMapping(value = "/define.js", produces = "text/javascript")
    public String test() {
        String s = objectMapper.writerWithView(Include.Public.class).writeValueAsString(configuration);
        return "const web2print = " + s + ";";
    }


}
