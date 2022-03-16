package api.app.astrodao.com.tests;

import api.app.astrodao.com.core.config.FrameworkContextConfig;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith({SpringExtension.class})
@ContextConfiguration(classes = {FrameworkContextConfig.class})
public abstract class BaseTest {
}
