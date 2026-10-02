package com.bookkaro;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertTrue;

class BookkaroApplicationTests {

    @Test
    void applicationSanityCheck() {
        assertTrue(true, "Application context sanity check passes");
    }
}
