package de.kettcards.web2print.web;

import de.kettcards.web2print.model.db.Texture;
import de.kettcards.web2print.repository.TextureRepository;
import de.kettcards.web2print.testUtils.SanityCheckTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc
@ActiveProfiles("web2print")
@SpringBootTest
public class TextureControllerText implements SanityCheckTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private TextureRepository textureRepository;

    @Test
    public void listEmpty() throws Exception {
        var result = mvc.perform(get("/test/texture"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(content().json("[]"))
                .andReturn();
    }

    @Test
    public void textureTest() throws Exception {
        //empty response
        assertTrue(textureRepository.findAll().isEmpty());
        expectJson("/test/texture", "[]");

        textureRepository.save(dummyTexture());
        expectJson("/test/texture", "[{}]");

    }


    private MvcResult expectJson(String url, String json) throws Exception {
        return mvc.perform(get(url))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(content().json(json))
                .andReturn();
    }

    private Texture dummyTexture() {
        var texture = new Texture();
        texture.setName("dummy");
        texture.setTiling("FRONT");
        texture.setTextureSlug("/dummy");
        return new Texture();
    }

}
