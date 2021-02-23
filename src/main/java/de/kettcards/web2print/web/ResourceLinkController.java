package de.kettcards.web2print.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.kettcards.web2print.config.ApplicationConfiguration;
import de.kettcards.web2print.model.Include;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;


@RestController
@RequestMapping
public final class ResourceLinkController {

    private final ApplicationConfiguration configuration;

    private final ObjectMapper objectMapper;

    public ResourceLinkController(ApplicationConfiguration configuration, ObjectMapper objectMapper) {
        this.configuration = configuration;
        this.objectMapper = objectMapper;
    }

    @GetMapping(value = "/define.js", produces = "text/javascript")
    public String getDefineJs() throws IOException {
        var s = objectMapper.writerWithView(Include.Public.class).writeValueAsString(configuration);
        return "const web2print = " + s + ";";
    }


}
