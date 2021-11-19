package api.app.astrodao.com.core.utils;

import api.app.astrodao.com.core.exceptions.CLIExecutionNotSuccessful;
import api.app.astrodao.com.core.exceptions.FailedToExecuteCLICommand;
import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@UtilityClass
public class CLIUtils {
    public synchronized static List<String> execute(String command) {
        String[] commandToExecute = {"bash", "-l", "-c", command};
        ProcessBuilder builder = new ProcessBuilder(commandToExecute);

        Process process;

        try {
            process = builder.start();
            process.waitFor(1, TimeUnit.MINUTES);
        } catch (IOException | InterruptedException exception) {
            log.error("Failed to execute '{}' CLI", command);
            throw new FailedToExecuteCLICommand(exception);
        }

        List<String> output = new BufferedReader(new InputStreamReader(process.getInputStream()))
                .lines().collect(Collectors.toList());

        int exitValue = process.exitValue();
        if (exitValue != 0) {
            throw new CLIExecutionNotSuccessful(
                    String.format("Something went wrong, got '%s' exit value for the process, console output:\n%s",
                    exitValue, output.stream().collect(Collectors.joining(System.lineSeparator())))
            );
        }

        return output;
    }
}
