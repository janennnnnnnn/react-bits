import { Box, Flex, Text } from '@chakra-ui/react';
import { Suspense, lazy } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import LibraryHeader, { libraryView, starterItems } from '../template-library/LibraryHeader';
import ToolSwitcher from '../tools/ToolSwitcher';
import ToolsIndex from '../tools/ToolsIndex';
import { TOOLS } from '../constants/Tools';
import { colors } from '../constants/colors';
import usePageSEO from '../hooks/usePageSEO';
import { PAGE_METADATA, getToolSEO } from '../constants/pageMetadata';
import '../tools/tools.css';
import '../css/site-page.css';

const components = {
  'background-studio': lazy(() => import('../tools/background-studio/BackgroundStudio')),
  'center-stage': lazy(() => import('../tools/center-stage/CenterStage')),
  'sound-lab': lazy(() => import('../tools/sound-lab/SoundLab'))
};

export default function ToolsPage() {
  const { toolId } = useParams();
  const tool = TOOLS.find(item => item.id === toolId);
  usePageSEO(tool ? getToolSEO(tool) : { ...PAGE_METADATA['/tools'], path: '/tools' });

  if (!tool) {
    return (
      <div className="template-library">
        <LibraryHeader />
        <div className="tl-layout">
          <aside className="tl-sidebar tl-tools-sidebar" aria-label="Get Started">
            <p>Get Started</p>
            {starterItems.map(item => (
              <Link key={item} to={libraryView(item)}>
                {item === 'Saved' && <Bookmark size={16} />}
                {item}
              </Link>
            ))}
          </aside>
          <ToolsIndex />
        </div>
      </div>
    );
  }

  const Component = components[tool.id];
  return (
    <div className="template-library rb-tools-page tl-tool-workspace">
      <LibraryHeader />
      <div className="tl-tool-content">
        <Box display="block" css={{ '@media (min-width: 1024px)': { display: 'none' } }} flexShrink={0}>
          <ToolSwitcher activeId={tool.id} />
        </Box>
        <Box flex={1} minH={0} overflow="hidden">
          <Suspense
            fallback={
              <Flex w="100%" h="100%" align="center" justify="center">
                <Text color={colors.accentMuted}>Loading…</Text>
              </Flex>
            }
          >
            <Component toolSelector={<ToolSwitcher activeId={tool.id} />} />
          </Suspense>
        </Box>
      </div>
    </div>
  );
}
